const mongoose = require('mongoose');

// --- Premium Subscription Schema ---
const premiumSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      default: 'active',
      index: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// --- Payment Schema ---
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PremiumSubscription',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const PremiumSubscription = mongoose.model('PremiumSubscription', premiumSubscriptionSchema);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = {
  PremiumSubscription,
  Payment,
};
