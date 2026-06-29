import api from './api';

export const getProfile = async () => {
  const res = await api.get('/users/me');
  return res.data.user;
};

export const updateProfile = async (data) => {
  const res = await api.put('/users/me', data);
  return res.data.user;
};

export const getPublicProfile = async (userId) => {
  const res = await api.get(`/users/${userId}`);
  return res.data?.data?.user || res.data?.user || res.data;
};
