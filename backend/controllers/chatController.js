const Room = require('../models/Room');
const Message = require('../models/Message');

// Helper to verify the requester belongs to a room before letting them read/write its chat
const assertMembership = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    const err = new Error('Room not found');
    err.statusCode = 404;
    throw err;
  }
  const isMember = room.members.some((m) => m.user.toString() === userId.toString());
  if (!isMember) {
    const err = new Error('You are not a member of this room');
    err.statusCode = 403;
    throw err;
  }
  return room;
};

// @route   GET /api/rooms/:id/messages?after=<ISODate>
// @access  Private
// Polling endpoint: frontend calls this every few seconds. The optional
// `after` query param lets the client fetch only new messages since their
// last poll, instead of redownloading the whole history each time.
const getMessages = async (req, res, next) => {
  try {
    await assertMembership(req.params.id, req.user._id);

    const query = { room: req.params.id };
    if (req.query.after) {
      query.createdAt = { $gt: new Date(req.query.after) };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(200);

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rooms/:id/messages
// @access  Private
// Body: { text }
const postMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    await assertMembership(req.params.id, req.user._id);

    const message = await Message.create({
      room: req.params.id,
      sender: req.user._id,
      senderName: req.user.name,
      text: text.trim().slice(0, 1000),
      isSystem: false,
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, postMessage };
