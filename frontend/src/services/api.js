import axios from 'axios';

// In dev, Vite proxies /api to localhost:5000 (see vite.config.js note below).
// In production (Vercel), VITE_API_URL should point at the deployed backend,
// e.g. https://moviemate-backend.vercel.app or a Render URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT to every outgoing request if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('moviemate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, bounce the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('moviemate_token');
      localStorage.removeItem('moviemate_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
