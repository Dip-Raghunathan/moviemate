import api from './api';
import { resolveDevAuth } from './devAuth';

export const signup = async (data) => {
  const res = await api.post('/auth/signup', data);
  return res.data?.data || res.data;
};

export const login = async (email, password) => {
  const devAuth = resolveDevAuth(email, password);
  if (devAuth) {
    return devAuth;
  }

  const res = await api.post('/auth/login', { email, password });
  return res.data?.data || res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data?.data || res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data?.data || res.data;
};

export const resetPassword = async (token, password) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data?.data || res.data;
};

export const getSessions = async () => {
  const res = await api.get('/auth/sessions');
  return res.data?.data || res.data;
};

export const revokeSession = async (sessionId) => {
  const res = await api.delete(`/auth/sessions/${sessionId}`);
  return res.data?.data || res.data;
};

export const revokeAllOtherSessions = async () => {
  const res = await api.delete('/auth/sessions');
  return res.data?.data || res.data;
};

