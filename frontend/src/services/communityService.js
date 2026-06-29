import api from './api';

export const getPublicCommunities = async () => {
  const res = await api.get('/communities/public');
  return res.data;
};

export const getMyCommunities = async () => {
  const res = await api.get('/communities/my');
  return res.data;
};

export const getCommunityDetails = async (id) => {
  const res = await api.get(`/communities/${id}`);
  return res.data;
};

export const createCommunity = async (data) => {
  const res = await api.post('/communities', data);
  return res.data;
};

export const joinCommunity = async (id) => {
  const res = await api.post(`/communities/${id}/join`);
  return res.data;
};

export const leaveCommunity = async (id) => {
  const res = await api.post(`/communities/${id}/leave`);
  return res.data;
};

export const getChannelMessages = async (communityId, channelId, after = null) => {
  const params = after ? { after } : {};
  const res = await api.get(`/communities/${communityId}/channels/${channelId}/messages`, { params });
  return res.data.data; // payload standard: res.data.data contains messages array
};

export const postChannelMessage = async (communityId, channelId, text) => {
  const res = await api.post(`/communities/${communityId}/channels/${channelId}/messages`, { text });
  return res.data.data;
};
