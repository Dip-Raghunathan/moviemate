const mongoose = require('mongoose');

// --- Friend Schema ---
const friendSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['friends', 'blocked', 'muted'],
      default: 'friends',
    },
  },
  { timestamps: true }
);

// Enforce unique relationship between user pairs
friendSchema.index({ user1: 1, user2: 1 }, { unique: true });

// --- Friend Request Schema ---
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// --- Follower Schema ---
const followerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

followerSchema.index({ user: 1, follower: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Follower = mongoose.model('Follower', followerSchema);

module.exports = {
  Friend,
  FriendRequest,
  Follower,
};
