const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      trim: true,
    },
    cinema: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD' to match exactly without timezone drift
      required: true,
    },
    time: {
      type: String, // stored as 'HH:mm'
      required: true,
    },
    matchType: {
      type: String,
      enum: ['solo', 'group'],
      required: true,
    },
    // Intent only meaningfully varies for solo rooms.
    // Group rooms are always 'friendship'.
    intent: {
      type: String,
      enum: ['friendship', 'date'],
      required: true,
      default: 'friendship',
    },
    // Only relevant when intent === 'friendship'.
    // If true, every member of this room must be female.
    womenOnly: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
      required: true, // 2 for solo, 4 for group
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        gender: { type: String, enum: ['male', 'female'], required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'full'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Helpful compound index: this is exactly the query shape the matching
// engine searches on, so index it for speed once data grows.
roomSchema.index({
  movie: 1,
  cinema: 1,
  date: 1,
  time: 1,
  matchType: 1,
  intent: 1,
  status: 1,
});

roomSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    movie: this.movie,
    cinema: this.cinema,
    date: this.date,
    time: this.time,
    matchType: this.matchType,
    intent: this.intent,
    womenOnly: this.womenOnly,
    capacity: this.capacity,
    status: this.status,
    members: this.members.map((m) => ({
      user: m.user,
      gender: m.gender,
      joinedAt: m.joinedAt,
    })),
    memberCount: this.members.length,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Room', roomSchema);
