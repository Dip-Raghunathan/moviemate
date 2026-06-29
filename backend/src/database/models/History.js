const mongoose = require('mongoose');

// --- Watch History Schema ---
const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: String,
      required: true,
      trim: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, movie: 1 });

// --- Search History Schema ---
const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

searchHistorySchema.index({ user: 1, searchedAt: -1 });

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = {
  WatchHistory,
  SearchHistory,
};
