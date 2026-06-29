const User = require('../../database/models/User');
const { PremiumSubscription, Payment } = require('../../database/models/Billing');
const PaymentWebhook = require('../../database/models/PaymentWebhook');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class BillingService {
  async getCurrentSubscription(userId) {
    const subscription = await PremiumSubscription.findOne({ user: userId });
    const payments = await Payment.find({ user: userId }).sort({ createdAt: -1 });

    return {
      subscription: subscription ? {
        status: subscription.status,
        plan: subscription.plan,
        expiresAt: subscription.expiresAt,
        updatedAt: subscription.updatedAt,
      } : null,
      payments: payments.map(p => ({
        id: p._id,
        amount: p.amount,
        status: p.status,
        transactionId: p.transactionId,
        invoiceNumber: p.invoiceNumber,
        date: p.createdAt,
      })),
    };
  }

  async createCheckoutSession(userId, plan, scenario = 'success') {
    if (!['monthly', 'yearly'].includes(plan)) {
      throw new BadRequestError("Plan must be 'monthly' or 'yearly'", 'INVALID_PLAN');
    }
    if (!['success', 'failure', 'timeout', 'webhook_delay'].includes(scenario)) {
      throw new BadRequestError("Invalid payment simulation scenario", 'INVALID_SCENARIO');
    }

    const price = plan === 'monthly' ? 9.99 : 99.99;
    const transactionId = 'txn_' + crypto.randomBytes(12).toString('hex');
    const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    return {
      sessionId: 'sess_' + crypto.randomBytes(16).toString('hex'),
      amount: price,
      plan,
      scenario,
      transactionId,
      invoiceNumber,
      clientSecret: 'cs_' + crypto.randomBytes(16).toString('hex'),
    };
  }

  async cancelSubscription(userId) {
    const subscription = await PremiumSubscription.findOne({ user: userId, status: 'active' });
    if (!subscription) {
      throw new NotFoundError('No active subscription found', 'SUBSCRIPTION_NOT_FOUND');
    }

    subscription.status = 'canceled';
    await subscription.save();

    const user = await User.findById(userId);
    if (user) {
      user.isPro = false;
      await user.save();
    }

    logger.auth(`Subscription canceled for user ${userId}`);
    return { success: true, subscription };
  }

  async processPaymentWebhook(eventId, payload) {
    // 1. Idempotency Check
    const existingWebhook = await PaymentWebhook.findOne({ eventId });
    if (existingWebhook) {
      logger.security(`Duplicate webhook event rejected! Event ID: ${eventId}`);
      throw new BadRequestError('Duplicate webhook event payload', 'DUPLICATE_WEBHOOK');
    }

    await PaymentWebhook.create({ eventId, status: 'processed' });

    const { userId, plan, amount, transactionId, invoiceNumber, scenario } = payload;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User associated with payment not found', 'USER_NOT_FOUND');
    }

    if (scenario === 'failure') {
      await Payment.create({
        user: userId,
        amount,
        status: 'failed',
        transactionId,
        invoiceNumber,
      });

      logger.auth(`Mock Payment failed for User ${userId}`);
      return { status: 'failed', message: 'Payment failure processed' };
    }

    // Success / Webhook Delay scenario: upgrade user and save records
    const expiresAt = new Date();
    if (plan === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    let subscription = await PremiumSubscription.findOne({ user: userId });
    if (!subscription) {
      subscription = new PremiumSubscription({
        user: userId,
        status: 'active',
        plan,
        expiresAt,
      });
    } else {
      subscription.status = 'active';
      subscription.plan = plan;
      subscription.expiresAt = expiresAt;
    }
    await subscription.save();

    await Payment.create({
      user: userId,
      subscription: subscription._id,
      amount,
      status: 'succeeded',
      transactionId,
      invoiceNumber,
    });

    user.isPro = true;
    await user.save();

    logger.auth(`Mock Payment succeeded. Upgraded User ${userId} to PRO tier.`);
    return { status: 'succeeded', message: 'Premium subscription activated successfully' };
  }
}

module.exports = new BillingService();
