const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true, // e.g. 'send-email', 'session-cleanup'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    errorHistory: [
      {
        error: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    runAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
