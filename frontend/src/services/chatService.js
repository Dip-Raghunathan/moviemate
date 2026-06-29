import api from './api';

export const getMessages = async (roomId, after) => {
  const params = after ? { after } : {};
  const res = await api.get(`/rooms/${roomId}/messages`, { params });
  return res.data?.data || res.data.messages;
};

export const postMessage = async (roomId, text) => {
  const res = await api.post(`/rooms/${roomId}/messages`, { text });
  return res.data?.data || res.data.message;
};
