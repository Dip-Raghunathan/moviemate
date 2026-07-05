const matchingRepository = require('./matching.repository');
const Notification = require('../../database/models/Notification');
const { sendNotification } = require('../../utils/notificationHelper');
const User = require('../../database/models/User');
const { Friend } = require('../../database/models/Social');
const Event = require('../../database/models/Event');
const Room = require('../../database/models/Room');
const { calculateCompatibility } = require('./matching.compatibility');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');
const socketUtil = require('../../utils/socket');

const normalizeName = (str) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

const getShowStartHour = (showTiming) => {
  const map = {
    'Morning Show': '10:00',
    'Afternoon Show': '14:00',
    'Evening Show': '18:00',
    'Night Show': '22:00'
  };
  return map[showTiming] || '18:00';
};

const emitRoomUpdated = (room) => {
  try {
    const io = socketUtil.getIO();
    if (io && room) {
      const { RoomDTO } = require('./matching.dto');
      const response = RoomDTO.fromRoom(room);
      io.to(room._id.toString()).emit('room_updated', response);
    }
  } catch (err) {
    console.error('Failed to emit room_updated via socket:', err);
  }
};

const updateStatsAndActivity = async (movieName, theatreName, activityMessage) => {
  try {
    const MovieStats = require('../../database/models/MovieStats');
    const TheatreStats = require('../../database/models/TheatreStats');
    const ActivityFeed = require('../../database/models/ActivityFeed');

    // 1. Update MovieStats (normalize strings to keep matches aligned)
    const normalizedMovie = movieName.trim();
    await MovieStats.findOneAndUpdate(
      { movieName: normalizedMovie },
      { $inc: { matchCount: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    // 2. Update TheatreStats (normalize strings)
    const normalizedTheatre = theatreName.trim();
    await TheatreStats.findOneAndUpdate(
      { theatreName: normalizedTheatre },
      { $inc: { matchCount: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    // 3. Create ActivityFeed entry
    await ActivityFeed.create({ message: activityMessage });

    // 4. Prune ActivityFeed to keep only newest 20
    const allActivities = await ActivityFeed.find().sort({ createdAt: -1 });
    if (allActivities.length > 20) {
      const idsToDelete = allActivities.slice(20).map(a => a._id);
      await ActivityFeed.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (err) {
    console.error('Failed to update stats and activity feed:', err);
  }
};

class MatchingService {
  async startMatch(user, matchPrefs) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this._executeStartMatch(user, matchPrefs);
      } catch (error) {
        if (error.name === 'VersionError' && attempt < maxRetries) {
          console.warn(`[Matching Concurrency] Version conflict on room. Retrying match attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
          continue;
        }
        throw error;
      }
    }
  }

  _isRoomCompatible(r, user, normalizedWomenOnly, blockedUserIds) {
    const now = new Date();
    // Auto-expire check
    const rExpiry = r.expiryTimestamp || new Date(new Date(`${r.date}T${getShowStartHour(r.showTiming)}`).getTime() + 3 * 60 * 60 * 1000);
    if (now > rExpiry) {
      return false;
    }
    // Full check
    if (r.status === 'Full' || r.status === 'full' || r.members.length >= r.capacity) {
      return false;
    }
    const hasBlockedMember = r.members.some((m) => m.user && blockedUserIds.includes(m.user._id.toString()));
    if (hasBlockedMember) {
      return false;
    }
    if (r.womenOnly && user.gender !== 'female') {
      return false;
    }
    if (normalizedWomenOnly && r.members.some(m => m.gender !== 'female')) {
      return false;
    }
    return true;
  }

  async _executeStartMatch(user, matchPrefs) {
    const { movie, cinema, city, date, showTiming, matchType, intent, womenOnly } = matchPrefs;

    if (!['solo', 'group'].includes(matchType)) {
      throw new BadRequestError("matchType must be 'solo' or 'group'", 'INVALID_MATCH_TYPE');
    }

    if (intent === 'date') {
      throw new BadRequestError('Dating feature is currently disabled', 'DATING_DISABLED');
    }

    const normalizedIntent = 'friendship';
    const normalizedWomenOnly =
      user.gender === 'female' ? Boolean(womenOnly) : false;

    const capacity = matchType === 'group' ? 4 : 2;

    const normalizedMovie = normalizeName(movie);
    const normalizedCinema = normalizeName(cinema);
    const normalizedCity = normalizeName(city || user.city || 'New York');

    const startHour = getShowStartHour(showTiming);
    const startDateTime = new Date(`${date}T${startHour}`);
    const expiryTimestamp = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000); // 3 hours later

    // 0. If user already owns or is in an active room for the exact same session, return that room immediately
    const existingRoom = await Room.findOne({
      'members.user': user._id,
      movie: normalizedMovie,
      city: normalizedCity,
      cinema: normalizedCinema,
      date,
      showTiming,
      status: { $in: ['Active', 'open', 'Full'] }
    }).populate('members.user', 'name age gender isPro');

    if (existingRoom) {
      return { matched: existingRoom.members.length === existingRoom.capacity, created: false, room: existingRoom };
    }

    // Fetch blocked relationships
    const blockedRels = await Friend.find({
      $or: [{ user1: user._id }, { user2: user._id }],
      status: 'blocked'
    });
    const blockedUserIds = blockedRels.map(r => r.user1.toString() === user._id.toString() ? r.user2.toString() : r.user1.toString());

    // 1. Query candidates for city-wide matches watching the same movie
    const query = {
      movie: normalizedMovie,
      city: normalizedCity,
      date,
      matchType,
      intent: normalizedIntent,
      status: { $in: ['Active', 'open'] }
    };

    let candidateRooms = await Room.find(query).populate('members.user', 'name age gender isPro');
    const validCandidates = [];

    for (const r of candidateRooms) {
      if (this._isRoomCompatible(r, user, normalizedWomenOnly, blockedUserIds)) {
        validCandidates.push(r);
      }
    }

    // Rank candidates by Priority 1, 2, or 3, and calculate compatibility
    const adjacency = {
      'Morning Show': ['Morning Show', 'Afternoon Show'],
      'Afternoon Show': ['Morning Show', 'Afternoon Show', 'Evening Show'],
      'Evening Show': ['Afternoon Show', 'Evening Show', 'Night Show'],
      'Night Show': ['Evening Show', 'Night Show']
    };

    const scoredRooms = [];
    for (const r of validCandidates) {
      const isSameTheatre = r.cinema === normalizedCinema;
      const isSameShowTiming = r.showTiming === showTiming;
      const isSimilarShowTiming = adjacency[showTiming]?.includes(r.showTiming) || isSameShowTiming;

      let priority = 1; // Priority 3: any theatre, same city
      if (isSameTheatre && isSameShowTiming) {
        priority = 3; // Priority 1: same theatre, same show timing
      } else if (!isSameTheatre && isSimilarShowTiming) {
        priority = 2; // Priority 2: nearby theatre, similar timing
      }

      let totalCompat = 0;
      let count = 0;
      for (const m of r.members) {
        if (m.user) {
          const compat = await calculateCompatibility(user, m.user, { movie: r.movie });
          totalCompat += compat.score || 0;
          count++;
        }
      }
      const avgCompat = count > 0 ? (totalCompat / count) : 50;

      scoredRooms.push({ room: r, priority, avgCompat });
    }

    // Sort: highest priority DESC, then highest compatibility DESC
    scoredRooms.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.avgCompat - a.avgCompat;
    });

    const matchedRoom = scoredRooms.length > 0 ? scoredRooms[0].room : null;

    if (matchedRoom) {
      const alreadyMember = matchedRoom.members.some((m) => m.user._id.toString() === user._id.toString());
      if (alreadyMember) {
        return { matched: true, room: matchedRoom };
      }

      // Update stats and activity feed
      const activityMessage = `Someone joined a ${matchedRoom.movie} match`;
      await updateStatsAndActivity(matchedRoom.movie, matchedRoom.cinema, activityMessage);

      if (!matchedRoom.pastMembers) {
        matchedRoom.pastMembers = [];
      }
      const isNewToRoom = !matchedRoom.pastMembers.some(
        (mId) => mId.toString() === user._id.toString()
      );
      if (isNewToRoom) {
        await matchingRepository.deleteRoomMessages(matchedRoom._id);
        matchedRoom.pastMembers.push(user._id);
      }

      // Notify existing members
      for (const m of matchedRoom.members) {
        if (m.user.toString() !== user._id.toString()) {
          await sendNotification({
            recipient: m.user,
            type: 'room_joined',
            title: 'Companion Joined',
            body: `${user.name} joined your movie room.`,
            deepLink: '/matching',
            priority: 'normal'
          });
        }
      }

      matchedRoom.members.push({ user: user._id, gender: user.gender, introduction: matchPrefs.introduction || 'Hi! Excited to watch this movie together.' });
      
      const hasMinGroupMembers = matchedRoom.matchType === 'group' && matchedRoom.members.length >= 2;
      const isSoloMatched = matchedRoom.matchType === 'solo' && matchedRoom.members.length >= 2;
      const isMatched = isSoloMatched || hasMinGroupMembers;

      if (matchedRoom.members.length >= capacity) {
        matchedRoom.status = 'Full';
      }
      await matchedRoom.save();
      await matchingRepository.createSystemMessage(matchedRoom._id, `${user.name} joined the room.`);
      
      emitRoomUpdated(matchedRoom);

      if (isMatched) {
        const titleText = matchedRoom.members.length === capacity ? 'Group Complete!' : 'Match Unlocked!';
        const bodyText = matchedRoom.members.length === capacity 
          ? `🎉 All 4 members have joined the group for ${matchedRoom.movie}!`
          : `🎉 Group chat is unlocked for ${matchedRoom.movie}! ${matchedRoom.members.length} members have joined.`;
          
        await this._createWatchEventForRoom(matchedRoom);
        
        for (const member of matchedRoom.members) {
          try {
            const memberId = member.user._id || member.user;
            await sendNotification({
              recipient: memberId,
              type: 'match_found',
              title: titleText,
              body: bodyText,
              deepLink: '/matching',
              priority: 'high',
            });
            await sendNotification({
              recipient: memberId,
              type: 'intro_received',
              title: 'Companion Introduction',
              body: 'A new movie companion introduction is available.',
              deepLink: '/matching',
              priority: 'normal',
            });
          } catch (err) {
            console.error('Failed to create match notification:', err);
          }
        }
      }
      return { matched: isMatched, room: matchedRoom };
    }

    // 2. If no compatible room exists, immediately create a new room and wait
    const newRoom = await Room.create({
      movie: normalizedMovie,
      cinema: normalizedCinema,
      city: normalizedCity,
      date,
      showTiming,
      time: startHour,
      matchType,
      intent: normalizedIntent,
      womenOnly: normalizedWomenOnly,
      capacity,
      status: 'Active',
      members: [{ user: user._id, gender: user.gender, introduction: matchPrefs.introduction || 'Hi! Excited to watch this movie together.' }],
      pastMembers: [user._id],
      expiryTimestamp,
      createdBy: user._id,
    });

    await matchingRepository.createSystemMessage(
      newRoom._id,
      `Room created. Movie: ${movie} @ ${showTiming}. Waiting for ${capacity - 1} more companion${capacity - 1 === 1 ? '' : 's'}...`
    );

    // Update stats and activity feed
    const activityMessage = matchType === 'group'
      ? `A new group match was created for ${newRoom.movie}`
      : `Someone is looking for a companion for ${newRoom.movie}`;
    await updateStatsAndActivity(newRoom.movie, newRoom.cinema, activityMessage);

    return { matched: false, created: true, room: newRoom };
  }

  async getRoom(roomId, userId) {
    const room = await Room.findById(roomId)
      .populate('members.user', 'name profilePicture favoriteGenres profile age gender privacy isPro');
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }

    const now = new Date();
    if (now > room.expiryTimestamp && room.status !== 'Expired') {
      room.status = 'Expired';
      await room.save();
      emitRoomUpdated(room);
      await this._notifyRoomExpired(room);
    }

    const isMember = room.members.some((m) => m.user && m.user._id.toString() === userId.toString());
    if (!isMember) {
      throw new BadRequestError('You are not a member of this room', 'ACCESS_FORBIDDEN');
    }

    const roomObj = room.toObject ? room.toObject() : room;
    const requestingUser = await User.findById(userId);
    for (let i = 0; i < roomObj.members.length; i++) {
      const member = roomObj.members[i];
      if (member.user && member.user._id.toString() !== userId.toString()) {
        const compat = await calculateCompatibility(requestingUser, member.user, { movie: roomObj.movie });
        member.compatibility = compat;
      } else if (member.user) {
        member.compatibility = { score: 100, explanation: "You!" };
      }
    }

    return roomObj;
  }

  async getMyRoom(userId) {
    const room = await Room.findOne({ 'members.user': userId, status: { $ne: 'Expired' } })
      .sort({ createdAt: -1 })
      .populate('members.user', 'name profilePicture favoriteGenres profile age gender privacy isPro');
    if (!room) return null;

    const now = new Date();
    if (now > room.expiryTimestamp) {
      room.status = 'Expired';
      await room.save();
      emitRoomUpdated(room);
      await this._notifyRoomExpired(room);
      return null;
    }

    const roomObj = room.toObject ? room.toObject() : room;
    const requestingUser = await User.findById(userId);
    for (let i = 0; i < roomObj.members.length; i++) {
      const member = roomObj.members[i];
      if (member.user && member.user._id.toString() !== userId.toString()) {
        const compat = await calculateCompatibility(requestingUser, member.user, { movie: roomObj.movie });
        member.compatibility = compat;
      } else if (member.user) {
        member.compatibility = { score: 100, explanation: "You!" };
      }
    }
    return roomObj;
  }

  async leaveRoom(roomId, userId) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this._executeLeaveRoom(roomId, userId);
      } catch (error) {
        if (error.name === 'VersionError' && attempt < maxRetries) {
          console.warn(`[Matching Concurrency] Version conflict on leaveRoom. Retrying attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
          continue;
        }
        throw error;
      }
    }
  }

  async _executeLeaveRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }

    const member = room.members.find((m) => m.user.toString() === userId.toString());
    if (!member) {
      throw new BadRequestError('You are not a member of this room', 'NOT_ROOM_MEMBER');
    }

    room.members = room.members.filter((m) => m.user.toString() !== userId.toString());

    if (room.members.length === 0) {
      await matchingRepository.deleteRoomMessages(room._id);
      await Room.findByIdAndDelete(room._id);
      try {
        const io = socketUtil.getIO();
        if (io) {
          io.to(room._id.toString()).emit('room_deleted', roomId);
        }
      } catch {}
      return { deleted: true };
    }

    // Host transfer logic: if creator/host leaves, assign ownership to oldest remaining member
    if (room.createdBy && room.createdBy.toString() === userId.toString()) {
      let oldestMember = null;
      let maxAge = -1;
      for (const m of room.members) {
        const u = await User.findById(m.user);
        if (u && u.age > maxAge) {
          maxAge = u.age;
          oldestMember = m.user;
        }
      }
      if (oldestMember) {
        room.createdBy = oldestMember;
      } else if (room.members[0]) {
        room.createdBy = room.members[0].user;
      }
    }

    room.status = 'Active';
    await room.save();
    
    emitRoomUpdated(room);

    return { deleted: false, room };
  }

  async getVacantRooms(userId, city = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const targetCity = city || user.city || 'Delhi';
    const normalizedCity = normalizeName(targetCity);
    const now = new Date();

    const rooms = await Room.find({
      city: normalizedCity,
      status: { $in: ['Active', 'open'] }
    }).populate('members.user', 'name age gender isPro');

    const validRooms = [];

    for (const room of rooms) {
      const timeStr = getShowStartHour(room.showTiming) || room.time || '18:00';
      const startDateTime = new Date(`${room.date}T${timeStr}`);
      const expiry = room.expiryTimestamp || new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);

      if (now > room.expiryTimestamp) {
        room.status = 'Expired';
        await room.save();
        emitRoomUpdated(room);
        await this._notifyRoomExpired(room);
        continue;
      }

      if (room.status === 'Full' || room.status === 'full' || room.members.length >= room.capacity) {
        if (room.status !== 'Full') {
          room.status = 'Full';
          await room.save();
          emitRoomUpdated(room);
        }
        continue;
      }

      const isMember = room.members.some((m) => m.user && m.user._id.toString() === userId.toString());
      if (isMember) {
        continue;
      }

      validRooms.push(room);
    }

    validRooms.sort((a, b) => {
      const timeA = getShowStartHour(a.showTiming) || a.time || '18:00';
      const timeB = getShowStartHour(b.showTiming) || b.time || '18:00';
      const dateA = new Date(`${a.date}T${timeA}`);
      const dateB = new Date(`${b.date}T${timeB}`);
      return dateA - dateB;
    });

    return validRooms;
  }

  async joinRoom(roomId, user, introduction = '') {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this._executeJoinRoom(roomId, user, introduction);
      } catch (error) {
        if (error.name === 'VersionError' && attempt < maxRetries) {
          console.warn(`[Matching Concurrency] Version conflict on joinRoom. Retrying attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
          continue;
        }
        throw error;
      }
    }
  }

  async _executeJoinRoom(roomId, user, introduction = '') {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Session not found', 'SESSION_NOT_FOUND');
    }
    
    const now = new Date();
    if (now > room.expiryTimestamp) {
      room.status = 'Expired';
      await room.save();
      emitRoomUpdated(room);
      throw new BadRequestError('This session has already expired', 'SESSION_EXPIRED');
    }

    const alreadyMember = room.members.some((m) => m.user.toString() === user._id.toString());
    if (alreadyMember) {
      return room;
    }

    if (room.status === 'Full' || room.status === 'full' || room.members.length >= room.capacity) {
      throw new BadRequestError('Session is already full', 'SESSION_FULL');
    }



    if (room.womenOnly && user.gender !== 'female') {
      throw new BadRequestError('This session is safety mode restricted to women only', 'WOMEN_ONLY_RESTRICTION');
    }

    if (!room.pastMembers) {
      room.pastMembers = [];
    }
    const isNewToRoom = !room.pastMembers.some(
      (mId) => mId.toString() === user._id.toString()
    );
    if (isNewToRoom) {
      await matchingRepository.deleteRoomMessages(room._id);
      room.pastMembers.push(user._id);
    }

    // Notify existing members
    for (const m of room.members) {
      if (m.user.toString() !== user._id.toString()) {
        await sendNotification({
          recipient: m.user,
          type: 'room_joined',
          title: 'Companion Joined',
          body: `${user.name} joined your movie room.`,
          deepLink: '/matching',
          priority: 'normal'
        });
      }
    }

    // Deduplicate array before pushing to guarantee uniqueness
    room.members = room.members.filter((m) => m.user.toString() !== user._id.toString());
    room.members.push({ user: user._id, gender: user.gender, introduction: introduction || 'Hi! Excited to watch this movie together.' });
    if (room.members.length >= room.capacity) {
      room.status = 'Full';
    }

    await room.save();

    await matchingRepository.createSystemMessage(room._id, `${user.name} joined the session`);
    
    emitRoomUpdated(room);

    if (room.status === 'Full') {
      await this._createWatchEventForRoom(room);
      await matchingRepository.createSystemMessage(room._id, 'Room is now full. Enjoy the movie!');
      for (const member of room.members) {
        try {
          await sendNotification({
            recipient: member.user._id,
            type: 'match_found',
            title: 'Match Found!',
            body: `🎉 You have a new movie match for ${room.movie} at ${room.cinema}, ${room.showTiming}.`,
            deepLink: '/matching',
            priority: 'high',
          });
          await sendNotification({
            recipient: member.user._id,
            type: 'intro_received',
            title: 'Companion Introduction',
            body: 'A new movie companion introduction is available.',
            deepLink: '/matching',
            priority: 'normal',
          });
        } catch (err) {
          console.error('Failed to create match notification:', err);
        }
      }
    }

    return room;
  }

  async _createWatchEventForRoom(room) {
    try {
      const showdateTime = new Date(`${room.date}T${getShowStartHour(room.showTiming)}`);
      const participants = room.members.map(m => m.user);
      const organizer = room.createdBy || participants[0];

      await Event.create({
        title: `${room.movie} Watch Meetup`,
        description: `Watch meetup for "${room.movie}" matched on PhilixMate!`,
        movie: room.movie,
        theatre: room.cinema,
        city: room.city || 'New York',
        showtime: showdateTime,
        organizer: organizer,
        participants: participants,
        room: room._id,
        status: 'scheduled'
      });
      console.log(`[Event Auto-Creation] Watch event created for room ${room._id}`);
    } catch (err) {
      console.error('[Event Auto-Creation] Failed to create watch event for room:', err);
    }
  }

  async getUnreviewedRoom(userId) {
    const Review = require('../../database/models/Review');
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rooms = await Room.find({
      $or: [
        { 'members.user': userId },
        { 'pastMembers': userId }
      ],
      $or: [
        { status: 'Expired' },
        { expiryTimestamp: { $lt: now } }
      ],
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });

    for (const room of rooms) {
      const reviewed = await Review.findOne({ movie: room.movie, user: userId });
      if (!reviewed) {
        return room;
      }
    }
    return null;
  }

  async setReadyToChat(roomId, userId) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this._executeSetReadyToChat(roomId, userId);
      } catch (error) {
        if (error.name === 'VersionError' && attempt < maxRetries) {
          console.warn(`[Matching Concurrency] Version conflict on setReadyToChat. Retrying attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
          continue;
        }
        throw error;
      }
    }
  }

  async _executeSetReadyToChat(roomId, userId) {
    const room = await Room.findById(roomId).populate('members.user');
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }

    const member = room.members.find(m => m.user._id.toString() === userId.toString());
    if (!member) {
      throw new BadRequestError('User is not a member of this room', 'NOT_MEMBER');
    }

    member.readyToChat = true;
    await room.save();

    emitRoomUpdated(room);

    // Notify other members that match accepted
    const otherMembers = room.members.filter(m => m.user._id.toString() !== userId.toString());
    for (const other of otherMembers) {
      await sendNotification({
        recipient: other.user._id,
        type: 'match_accepted',
        title: 'Match Accepted',
        body: `${member.user.name || 'Someone'} accepted your match request.`,
        deepLink: '/matching',
        priority: 'normal'
      });
    }

    // Check if all members are ready
    const allReady = room.members.every(m => m.readyToChat === true);
    if (allReady) {
      for (const m of room.members) {
        await sendNotification({
          recipient: m.user._id,
          type: 'chat_started',
          title: 'Chat Ready!',
          body: 'Your movie chat room is now ready.',
          deepLink: `/chat/${room._id}`,
          priority: 'high'
        });
      }
      try {
        const io = socketUtil.getIO();
        if (io) {
          io.to(room._id.toString()).emit('ready_for_chat', roomId);
        }
      } catch (err) {
        console.error('Failed to emit ready_for_chat via socket:', err);
      }
    }

    return { allReady, room };
  }

  async _notifyRoomExpired(room) {
    try {
      for (const member of room.members) {
        const mId = member.user?._id || member.user;
        if (mId) {
          await sendNotification({
            recipient: mId,
            type: 'room_closed',
            title: 'Room Closed',
            body: 'Your movie room has been closed after the showtime.',
            deepLink: '/dashboard',
            priority: 'normal'
          });
        }
      }
    } catch (err) {
      console.error('Failed to notify room expiration:', err);
    }
  }

  async leaveIntro(roomId, userId) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        return await this._executeLeaveIntro(roomId, userId);
      } catch (error) {
        if (error.name === 'VersionError' && attempt < maxRetries) {
          console.warn(`[Matching Concurrency] Version conflict on leaveIntro. Retrying attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 150 + 50));
          continue;
        }
        throw error;
      }
    }
  }

  async _executeLeaveIntro(roomId, userId) {
    const room = await Room.findById(roomId).populate('members.user');
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }

    const member = room.members.find(m => m.user._id.toString() === userId.toString());
    if (!member) {
      throw new BadRequestError('User is not a member of this room', 'NOT_MEMBER');
    }

    // Remove this user from members list
    room.members = room.members.filter(m => m.user._id.toString() !== userId.toString());

    // Reset status back to Active (so it becomes vacant for others to join)
    room.status = 'Active';
    // Reset readyToChat state for remaining users
    for (const m of room.members) {
      m.readyToChat = false;
    }

    await room.save();

    try {
      const io = socketUtil.getIO();
      if (io) {
        io.to(room._id.toString()).emit('companion_left_intro', {
          message: 'Your companion left before chat started.'
        });
      }
    } catch (err) {
      console.error('Failed to emit companion_left_intro socket event:', err);
    }

    emitRoomUpdated(room);

    return { left: true };
  }

  async updateRoom(roomId, userId, updates) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }
    if (room.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenError('Only the creator can edit this room', 'UNAUTHORIZED_ROOM_EDIT');
    }
    
    if (updates.cinema) room.cinema = normalizeName(updates.cinema);
    if (updates.movie) room.movie = normalizeName(updates.movie);
    if (updates.date) room.date = updates.date;
    if (updates.showTiming) {
      room.showTiming = updates.showTiming;
      room.time = getShowStartHour(updates.showTiming);
    }
    
    await room.save();
    emitRoomUpdated(room);
    return room;
  }

  async deleteRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }
    if (room.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenError('Only the creator can delete this room', 'UNAUTHORIZED_ROOM_DELETE');
    }
    await matchingRepository.deleteRoomMessages(room._id);
    await Room.findByIdAndDelete(room._id);
    try {
      const io = socketUtil.getIO();
      if (io) {
        io.to(room._id.toString()).emit('room_deleted', roomId);
      }
    } catch (err) {
      console.error('Failed to emit room_deleted socket event:', err);
    }
    return { deleted: true };
  }
}

module.exports = new MatchingService();
