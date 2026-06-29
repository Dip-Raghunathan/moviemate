import api from './api';

export const getEngagementStats = async () => {
  const res = await api.get('/engagement/stats');
  return res.data;
};

export const checkIn = async () => {
  const res = await api.post('/engagement/checkin');
  return res.data;
};
