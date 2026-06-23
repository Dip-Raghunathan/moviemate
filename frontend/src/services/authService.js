import api from './api';

export const signup = async (data) => {
  const res = await api.post('/auth/signup', data);
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data;
};
