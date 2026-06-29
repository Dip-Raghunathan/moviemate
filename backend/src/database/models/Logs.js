const mongoose = require('mongoose');

// --- Error Log Schema ---
const errorLogSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// --- Activity / Audit Log Schema ---
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = {
  ErrorLog,
  ActivityLog,
};
