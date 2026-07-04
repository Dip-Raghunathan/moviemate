import api from './api';

// prefs: { movie, cinema, date, time, matchType, intent, womenOnly, introduction }
export const startMatch = async (prefs) => {
  const res = await api.post('/rooms/match', prefs);
  return res.data?.data || res.data;
};

export const getRoom = async (roomId) => {
  const res = await api.get(`/rooms/${roomId}`);
  return res.data?.data || res.data;
};

export const getMyRoom = async () => {
  const res = await api.get('/rooms/my-room');
  return res.data?.data || res.data;
};

export const getUnreviewedRoom = async () => {
  const res = await api.get('/rooms/unreviewed-room');
  return res.data?.data || res.data;
};

export const leaveRoom = async (roomId) => {
  const res = await api.post(`/rooms/${roomId}/leave`);
  return res.data?.data || res.data;
};

export const getVacantRooms = async (city) => {
  const params = city ? { city } : {};
  const res = await api.get('/rooms/vacant', { params });
  return res.data?.data || res.data;
};

export const joinRoom = async (roomId, introduction = '') => {
  const res = await api.post(`/rooms/${roomId}/join`, { introduction });
  return res.data?.data || res.data;
};

export const readyForChat = async (roomId) => {
  const res = await api.post(`/rooms/${roomId}/ready`);
  return res.data?.data || res.data;
};

export const leaveIntro = async (roomId) => {
  const res = await api.post(`/rooms/${roomId}/leave-intro`);
  return res.data?.data || res.data;
};
