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
    city: {
      type: String,
      default: 'New York',
      trim: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
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
    intent: {
      type: String,
      enum: ['friendship', 'date'],
      required: true,
      default: 'friendship',
    },
    womenOnly: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        gender: { type: String, enum: ['male', 'female'], required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    pastMembers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    status: {
      type: String,
      enum: ['open', 'full'],
      default: 'open',
    },
    // --- Enterprise Evolution Fields ---
    isArchived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Compound index for matching speed (and excludes deleted/archived rooms)
roomSchema.index({
  movie: 1,
  cinema: 1,
  date: 1,
  time: 1,
  matchType: 1,
  intent: 1,
  status: 1,
  isDeleted: 1,
  isArchived: 1,
});

roomSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    movie: this.movie,
    cinema: this.cinema,
    city: this.city || 'New York',
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
    pastMembers: this.pastMembers || [],
    isArchived: this.isArchived,
    createdBy: this.createdBy,
    isDeleted: this.isDeleted,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Room', roomSchema);
