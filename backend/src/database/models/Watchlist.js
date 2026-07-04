const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    movieName: {
      type: String,
      required: [true, 'Movie name is required'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Enforce unique movie per user
watchlistSchema.index({ userId: 1, movieName: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
