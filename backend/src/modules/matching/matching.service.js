const matchingRepository = require('./matching.repository');
const Notification = require('../../database/models/Notification');
const User = require('../../database/models/User');
const { Friend } = require('../../database/models/Social');
const Event = require('../../database/models/Event');
const { calculateCompatibility } = require('./matching.compatibility');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const CAPACITY = { solo: 2, group: 4 };

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

  async _executeStartMatch(user, matchPrefs) {
    const { movie, cinema, city, date, time, matchType, intent, womenOnly } = matchPrefs;

    if (!['solo', 'group'].includes(matchType)) {
      throw new BadRequestError("matchType must be 'solo' or 'group'", 'INVALID_MATCH_TYPE');
    }

    const normalizedIntent = matchType === 'group' ? 'friendship' : intent;
    if (!['friendship', 'date'].includes(normalizedIntent)) {
      throw new BadRequestError("intent must be 'friendship' or 'date'", 'INVALID_INTENT');
    }
    if (normalizedIntent === 'date' && matchType !== 'solo') {
      throw new BadRequestError('Date intent is only available for Solo Match', 'INVALID_INTENT_COMBINATION');
    }

    const normalizedWomenOnly =
      normalizedIntent === 'friendship' && user.gender === 'female' ? Boolean(womenOnly) : false;

    const capacity = CAPACITY[matchType];

    const baseQuery = {
      movie: movie.trim(),
      cinema: cinema.trim(),
      city: (city || 'New York').trim(),
      date,
      time,
      matchType,
      intent: normalizedIntent,
      status: 'open',
    };

    let candidateRooms;

    if (normalizedIntent === 'date') {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      candidateRooms = await matchingRepository.findCandidateRooms({
        ...baseQuery,
        'members.0.gender': oppositeGender,
      });
    } else {
      if (user.gender === 'male') {
        candidateRooms = await matchingRepository.findCandidateRooms({
          ...baseQuery,
          womenOnly: false,
        });
      } else {
        candidateRooms = await matchingRepository.findCandidateRooms({
          ...baseQuery,
          womenOnly: normalizedWomenOnly,
        });
      }
    }

    const blockedRels = await Friend.find({
      $or: [{ user1: user._id }, { user2: user._id }],
      status: 'blocked'
    });
    const blockedUserIds = blockedRels.map(r => r.user1.toString() === user._id.toString() ? r.user2.toString() : r.user1.toString());

    let room = candidateRooms.find((r) => {
      if (r.members.length >= capacity) return false;
      const hasBlockedMember = r.members.some((m) => blockedUserIds.includes(m.user.toString()));
      return !hasBlockedMember;
    });

    if (room) {
      const alreadyMember = room.members.some((m) => m.user.toString() === user._id.toString());
      if (alreadyMember) {
        return room;
      }

      if (normalizedIntent === 'date') {
        const existingGender = room.members[0]?.gender;
        if (existingGender === user.gender) {
          room = null;
        }
      }

      if (normalizedIntent === 'friendship' && room.womenOnly && user.gender !== 'female') {
        room = null;
      }
    }

    if (room) {
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

      room.members.push({ user: user._id, gender: user.gender });
      if (room.members.length >= capacity) {
        room.status = 'full';
      }
      await matchingRepository.saveRoom(room);
      await matchingRepository.createSystemMessage(room._id, `${user.name} joined the room.`);
      if (room.status === 'full') {
        await this._createWatchEventForRoom(room);
        await matchingRepository.createSystemMessage(room._id, 'Room is now full. Enjoy the movie!');
        // Notify all members that a match is found
        for (const member of room.members) {
          try {
            await Notification.create({
              recipient: member.user,
              type: 'match_found',
              title: 'Match Found!',
              body: `Your match for ${room.movie} is ready! Chat now.`,
              deepLink: `/chat/${room._id}`,
              priority: 'high',
            });
          } catch (err) {
            console.error('Failed to create match notification:', err);
          }
        }
      }
      return room;
    }

    const newRoom = await matchingRepository.createRoom({
      movie: movie.trim(),
      cinema: cinema.trim(),
      city: (city || 'New York').trim(),
      date,
      time,
      matchType,
      intent: normalizedIntent,
      womenOnly: normalizedWomenOnly,
      capacity,
      status: 'open',
      members: [{ user: user._id, gender: user.gender }],
      pastMembers: [user._id],
    });

    await matchingRepository.createSystemMessage(
      newRoom._id,
      `Room created. Movie: ${movie} @ ${time}. Waiting for ${capacity - 1} more ${capacity - 1 === 1 ? 'companion' : 'companions'}...`
    );

    return newRoom;
  }

  async getRoom(roomId, userId) {
    const room = await matchingRepository.findRoomByIdPopulated(roomId);
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }

    const isMember = room.members.some((m) => m.user._id.toString() === userId.toString());
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
    const room = await matchingRepository.findUserActiveRoom(userId);
    if (!room) return null;

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
    const room = await matchingRepository.findRoomById(roomId);
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
      await matchingRepository.deleteRoom(room._id);
      return { deleted: true };
    }

    room.status = 'open';
    await matchingRepository.saveRoom(room);
    return { deleted: false, room };
  }

  async getVacantRooms(userId, city = null) {
    return matchingRepository.findVacantRooms(userId, city);
  }

  async joinRoom(roomId, user) {
    const room = await matchingRepository.findRoomById(roomId);
    if (!room) {
      throw new NotFoundError('Session not found', 'SESSION_NOT_FOUND');
    }
    if (room.status !== 'open') {
      throw new BadRequestError('Session is no longer vacant/open', 'SESSION_CLOSED');
    }

    const alreadyMember = room.members.some((m) => m.user.toString() === user._id.toString());
    if (alreadyMember) {
      return room;
    }

    // Leave any other active room first
    const activeRoom = await matchingRepository.findUserActiveRoom(user._id);
    if (activeRoom) {
      await this.leaveRoom(activeRoom._id, user._id);
    }

    const capacity = CAPACITY[room.matchType];
    if (room.members.length >= capacity) {
      throw new BadRequestError('Session is already full', 'SESSION_FULL');
    }

    if (room.intent === 'date') {
      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      const wrongGender = room.members.some((m) => m.gender !== oppositeGender);
      if (wrongGender) {
        throw new BadRequestError('Date sessions must pair opposite genders', 'GENDER_MISMATCH');
      }
    } else if (room.womenOnly && user.gender !== 'female') {
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

    room.members.push({ user: user._id, gender: user.gender });
    if (room.members.length >= capacity) {
      room.status = 'full';
    }

    await room.save();

    await matchingRepository.createSystemMessage(room._id, `${user.name} joined the session`);

    if (room.status === 'full') {
      await this._createWatchEventForRoom(room);
      await matchingRepository.createSystemMessage(room._id, 'Room is now full. Enjoy the movie!');
    }

    return room;
  }

  async _createWatchEventForRoom(room) {
    try {
      const showdateTime = new Date(`${room.date}T${room.time || '18:00'}`);
      const participants = room.members.map(m => m.user);
      const organizer = room.createdBy || participants[0];

      await Event.create({
        title: `${room.movie} Watch Meetup`,
        description: `Watch meetup for "${room.movie}" matched on VX ShowMate!`,
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
}

module.exports = new MatchingService();
