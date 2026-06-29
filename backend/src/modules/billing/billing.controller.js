const billingService = require('./billing.service');
const crypto = require('crypto');

class BillingController {
  getSubscription = async (req, res, next) => {
    try {
      const data = await billingService.getCurrentSubscription(req.user._id);
      return res.success(data, 'Subscription data loaded');
    } catch (error) {
      next(error);
    }
  };

  createCheckoutSession = async (req, res, next) => {
    try {
      const { plan, scenario } = req.body;
      const session = await billingService.createCheckoutSession(req.user._id, plan, scenario);

      // Handle simulated payment timeout
      if (scenario === 'timeout') {
        // Deliberately delay the response beyond the client's 10s Axios timeout limit
        await new Promise((resolve) => setTimeout(resolve, 11000));
      }

      return res.success(session, 'Checkout session created');
    } catch (error) {
      next(error);
    }
  };

  processWebhook = async (req, res, next) => {
    try {
      const { eventId, payload } = req.body;

      // If scenario is 'webhook_delay', process it asynchronously after 4 seconds
      if (payload.scenario === 'webhook_delay') {
        res.success({ status: 'pending', message: 'Webhook delivery scheduled' });
        
        setTimeout(async () => {
          try {
            await billingService.processPaymentWebhook(eventId, payload);
          } catch (err) {
            console.error('[Async Webhook Process Error]:', err.message);
          }
        }, 4000);
        return;
      }

      const result = await billingService.processPaymentWebhook(eventId, payload);
      return res.success(result, 'Webhook event processed');
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (req, res, next) => {
    try {
      const result = await billingService.cancelSubscription(req.user._id);
      return res.success(result, 'Premium subscription cancelled');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BillingController();
