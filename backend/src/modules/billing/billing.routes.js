const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.get('/subscription', protect, billingController.getSubscription);
router.post('/checkout', protect, billingController.createCheckoutSession);
router.post('/cancel', protect, billingController.cancelSubscription);

// Stripe webhook simulation endpoint (public, matching standard payment gateways)
router.post('/webhook', billingController.processWebhook);

module.exports = router;
