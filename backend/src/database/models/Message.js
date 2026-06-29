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
      required: true,
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
    // --- Enterprise Evolution Fields ---
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
      index: true, // index for thread lookups
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true, // index for pinned room lookups
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        emoji: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video', 'audio', 'file'], required: true },
        name: { type: String, default: '' },
        sizeBytes: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ room: 1, createdAt: 1 });
messageSchema.index({ room: 1, isDeleted: 1 });
messageSchema.index({ room: 1, isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
