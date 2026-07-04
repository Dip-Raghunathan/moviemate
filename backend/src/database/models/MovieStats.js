const mongoose = require('mongoose');

const movieStatsSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    matchCount: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('MovieStats', movieStatsSchema);
