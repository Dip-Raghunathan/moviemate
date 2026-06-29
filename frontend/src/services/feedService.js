import api from './api';

export const getSocialFeed = async () => {
  const res = await api.get('/feed');
  return res.data;
};

export const getPersonalizedRecommendations = async () => {
  const res = await api.get('/feed/recommendations');
  return res.data;
};
