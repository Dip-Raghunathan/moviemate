const Room = require('../models/Room');
const User = require('../models/User');
const { findOrCreateRoom, leaveRoom } = require('../utils/matchingEngine');

// @route   POST /api/rooms/match
// @access  Private
// Body: { movie, cinema, date, time, matchType, intent, womenOnly }
const startMatch = async (req, res, next) => {
  try {
    const { movie, cinema, date, time, matchType, intent, womenOnly } = req.body;

    if (!movie || !cinema || !date || !time || !matchType) {
      return res.status(400).json({ message: 'movie, cinema, date, time, and matchType are all required' });
    }

    const room = await findOrCreateRoom({
      user: req.user,
      movie,
      cinema,
      date,
      time,
      matchType,
      intent: intent || 'friendship',
      womenOnly: Boolean(womenOnly),
    });

    res.status(200).json({ room: room.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rooms/:id
// @access  Private
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('members.user', 'name profilePicture');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Only members may view the room
    const isMember = room.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }

    const safe = room.toSafeObject();
    // Replace bare ObjectIds with populated name/pic for the member list UI
    safe.members = room.members.map((m) => ({
      user: m.user._id,
      name: m.user.name,
      profilePicture: m.user.profilePicture,
      gender: m.gender,
      joinedAt: m.joinedAt,
    }));

    res.json({ room: safe });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rooms/my-room
// @access  Private
// Convenience endpoint: returns the user's current open/full room, if any.
// Useful for "resume session" on reload without storing room id client-side.
const getMyRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ 'members.user': req.user._id })
      .sort({ createdAt: -1 })
      .populate('members.user', 'name profilePicture');

    if (!room) return res.json({ room: null });

    const safe = room.toSafeObject();
    safe.members = room.members.map((m) => ({
      user: m.user._id,
      name: m.user.name,
      profilePicture: m.user.profilePicture,
      gender: m.gender,
      joinedAt: m.joinedAt,
    }));

    res.json({ room: safe });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rooms/:id/leave
// @access  Private
const leave = async (req, res, next) => {
  try {
    const result = await leaveRoom(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { startMatch, getRoom, getMyRoom, leave };
