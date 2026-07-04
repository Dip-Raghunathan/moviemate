const mongoose = require('mongoose');

const communityNoteSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 120
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('CommunityNote', communityNoteSchema);
