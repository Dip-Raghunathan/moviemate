const Room = require('../models/Room');
const Message = require('../models/Message');

/**
 * MATCHING RULES (agreed spec):
 *
 * matchType: 'solo' (capacity 2) | 'group' (capacity 4)
 * intent:    'friendship' | 'date'   -- 'date' is ONLY valid when matchType === 'solo'
 *            group rooms are ALWAYS 'friendship', no gender filtering at all.
 *
 * Friendship (solo or group):
 *   - Anyone can match with anyone, EXCEPT:
 *   - womenOnly flag: if the joining/creating user is female and has
 *     womenOnlyMode enabled, they only join/create rooms where womenOnly = true.
 *     A womenOnly room can never accept a male member.
 *     Men are never restricted by this — they simply cannot join womenOnly rooms.
 *
 * Date (solo only):
 *   - Strictly opposite-gender. A male can only ever occupy a room with a female,
 *     and vice versa. capacity is always 2 (1 man + 1 woman).
 *   - womenOnly flag is meaningless here and always stored as false.
 */

const CAPACITY = { solo: 2, group: 4 };

/**
 * Finds an existing open room matching the criteria, or creates a new one,
 * then adds the user to it. Returns the populated room.
 */
const findOrCreateRoom = async ({ user, movie, cinema, date, time, matchType, intent, womenOnly }) => {
  if (!['solo', 'group'].includes(matchType)) {
    throw badRequest("matchType must be 'solo' or 'group'");
  }

  // Group rooms are always friendship - normalize regardless of what client sent
  const normalizedIntent = matchType === 'group' ? 'friendship' : intent;
  if (!['friendship', 'date'].includes(normalizedIntent)) {
    throw badRequest("intent must be 'friendship' or 'date'");
  }
  if (normalizedIntent === 'date' && matchType !== 'solo') {
    throw badRequest('Date intent is only available for Solo Match');
  }

  // womenOnly only makes sense for friendship rooms, and only a female user
  // can originate it. Force it false otherwise so it never leaks into Date logic.
  const normalizedWomenOnly =
    normalizedIntent === 'friendship' && user.gender === 'female' ? Boolean(womenOnly) : false;

  const capacity = CAPACITY[matchType];

  // Build the search query depending on intent
  const baseQuery = {
    movie: movie.trim(),
    cinema: cinema.trim(),
    date,
    time,
    matchType,
    intent: normalizedIntent,
    status: 'open',
  };

  let candidateRooms;

  if (normalizedIntent === 'date') {
    // Date: need a room that currently has exactly one member of the opposite gender
    const oppositeGender = user.gender === 'male' ? 'female' : 'male';
    candidateRooms = await Room.find({
      ...baseQuery,
      'members.0.gender': oppositeGender,
    }).sort({ createdAt: 1 });
  } else {
    // Friendship: respect the womenOnly flag - a womenOnly room must match womenOnly,
    // and a male user must never see/join womenOnly rooms.
    if (user.gender === 'male') {
      candidateRooms = await Room.find({
        ...baseQuery,
        womenOnly: false,
      }).sort({ createdAt: 1 });
    } else {
      // Female user: if she wants womenOnly, only match womenOnly rooms.
      // If she doesn't, only match non-womenOnly rooms (so she isn't pulled into
      // a safety room she didn't ask for, and so womenOnly rooms stay all-female).
      candidateRooms = await Room.find({
        ...baseQuery,
        womenOnly: normalizedWomenOnly,
      }).sort({ createdAt: 1 });
    }
  }

  // Find the first candidate that actually has space and whose membership
  // is still consistent with the rules (defensive re-check in case of races)
  let room = candidateRooms.find((r) => r.members.length < capacity);

  if (room) {
    // Defensive re-validation before joining
    const alreadyMember = room.members.some((m) => m.user.toString() === user._id.toString());
    if (alreadyMember) {
      return room; // idempotent - user re-requesting same match just rejoins
    }

    if (normalizedIntent === 'date') {
      const existingGender = room.members[0]?.gender;
      if (existingGender === user.gender) {
        room = null; // shouldn't happen given query, but guard anyway
      }
    }

    if (normalizedIntent === 'friendship' && room.womenOnly && user.gender !== 'female') {
      room = null; // hard guard - never let a male into a womenOnly room
    }
  }

  if (room) {
    room.members.push({ user: user._id, gender: user.gender });
    if (room.members.length >= capacity) {
      room.status = 'full';
    }
    await room.save();
    await postSystemMessage(room._id, `${user.name} joined the room.`);
    if (room.status === 'full') {
      await postSystemMessage(room._id, 'Room is now full. Enjoy the movie! 🎬');
    }
    return room;
  }

  // No suitable room found - create a new one
  const newRoom = await Room.create({
    movie: movie.trim(),
    cinema: cinema.trim(),
    date,
    time,
    matchType,
    intent: normalizedIntent,
    womenOnly: normalizedWomenOnly,
    capacity,
    status: 'open',
    members: [{ user: user._id, gender: user.gender }],
  });

  await postSystemMessage(
    newRoom._id,
    `Room created. Movie: ${movie} @ ${time}. Waiting for ${capacity - 1} more ${capacity - 1 === 1 ? 'companion' : 'companions'}...`
  );

  return newRoom;
};

const postSystemMessage = async (roomId, text) => {
  await Message.create({
    room: roomId,
    sender: null,
    senderName: 'System',
    text,
    isSystem: true,
  });
};

const badRequest = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

/**
 * Removes a user from a room. If the room becomes empty, it's deleted.
 * If it was full, it reopens to 'open' status since there's now space.
 */
const leaveRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw notFoundErr('Room not found');
  }

  const member = room.members.find((m) => m.user.toString() === userId.toString());
  if (!member) {
    throw badRequest('You are not a member of this room');
  }

  room.members = room.members.filter((m) => m.user.toString() !== userId.toString());

  if (room.members.length === 0) {
    await Message.deleteMany({ room: room._id });
    await Room.findByIdAndDelete(room._id);
    return { deleted: true };
  }

  room.status = 'open'; // there's now space again
  await room.save();

  return { deleted: false, room };
};

const notFoundErr = (message) => {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
};

module.exports = { findOrCreateRoom, leaveRoom, postSystemMessage, CAPACITY };
