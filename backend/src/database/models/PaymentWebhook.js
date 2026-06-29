const mongoose = require('mongoose');

const paymentWebhookSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'processed',
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentWebhook', paymentWebhookSchema);
