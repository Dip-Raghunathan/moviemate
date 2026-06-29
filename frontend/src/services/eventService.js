import api from './api';

export const getEvents = async (city) => {
  const params = city ? { city } : {};
  const res = await api.get('/events', { params });
  return res.data;
};

export const createEvent = async (data) => {
  const res = await api.post('/events', data);
  return res.data;
};

export const rsvpEvent = async (eventId, rsvp) => {
  const res = await api.post(`/events/${eventId}/rsvp`, { rsvp });
  return res.data;
};
