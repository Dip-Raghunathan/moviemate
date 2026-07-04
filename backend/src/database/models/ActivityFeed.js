const mongoose = require('mongoose');

const activityFeedSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('ActivityFeed', activityFeedSchema);
