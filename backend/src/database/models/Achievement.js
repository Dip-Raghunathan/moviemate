const mongoose = require('mongoose');

// --- Badge Schema ---
const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true, // emoji or image URL
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// --- User Statistics & Badges Schema ---
const userStatisticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    moviesCount: {
      type: Number,
      default: 0,
    },
    matchesCount: {
      type: Number,
      default: 0,
    },
    roomsCount: {
      type: Number,
      default: 0,
    },
    unlockedBadges: [
      {
        badge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
          required: true,
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);
const UserStatistics = mongoose.model('UserStatistics', userStatisticsSchema);

module.exports = {
  Badge,
  UserStatistics,
};
