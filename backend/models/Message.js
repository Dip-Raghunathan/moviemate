const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // null/absent for system messages
    },
    senderName: {
      type: String,
      required: true, // denormalized so chat renders fast without populate, also used for "System"
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // createdAt acts as the message timestamp
);

messageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
