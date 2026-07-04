const mongoose = require('mongoose');

const theatreStatsSchema = new mongoose.Schema(
  {
    theatreName: {
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

module.exports = mongoose.model('TheatreStats', theatreStatsSchema);
