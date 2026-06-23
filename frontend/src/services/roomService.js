import api from './api';

// prefs: { movie, cinema, date, time, matchType, intent, womenOnly }
export const startMatch = async (prefs) => {
  const res = await api.post('/rooms/match', prefs);
  return res.data;
};

export const getRoom = async (roomId) => {
  const res = await api.get(`/rooms/${roomId}`);
  return res.data;
};

export const getMyRoom = async () => {
  const res = await api.get('/rooms/my-room');
  return res.data;
};

export const leaveRoom = async (roomId) => {
  const res = await api.post(`/rooms/${roomId}/leave`);
  return res.data;
};
