import api from './api';

export const getProfile = async () => {
  const res = await api.get('/users/me');
  return res.data.user;
};

export const updateProfile = async (data) => {
  const res = await api.put('/users/me', data);
  return res.data.user;
};
