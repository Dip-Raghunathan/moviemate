import api from './api';

export const getSubscription = async () => {
  const res = await api.get('/billing/subscription');
  return res.data;
};

export const createCheckoutSession = async (plan, scenario) => {
  const res = await api.post('/billing/checkout', { plan, scenario });
  return res.data;
};

export const cancelSubscription = async () => {
  const res = await api.post('/billing/cancel');
  return res.data;
};

export const triggerMockWebhook = async (eventId, payload) => {
  const res = await api.post('/billing/webhook', { eventId, payload });
  return res.data;
};
