import api from './api';

export const getDiscoverFeed = async () => {
  const res = await api.get('/discover');
  return res.data?.data || res.data;
};

export const postCommunityNote = async (text) => {
  const res = await api.post('/discover/notes', { text });
  return res.data?.data || res.data;
};
