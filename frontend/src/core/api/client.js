import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/v1`
  : '/api/v1';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

const notifyOffline = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-offline', {
      detail: { message: 'You appear to be offline. Reconnect and try again.' },
    }));
  }
};

// Attach JWT token to all requests
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('philixmate_token');
    config.headers = {
      ...config.headers,
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically handles auth errors and implements retries
client.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === 'success') {
      return response;
    }
    return response;
  },
  async (error) => {
    const { config = {}, response } = error;
    const isOffline = typeof navigator !== 'undefined' && (!navigator.onLine || error.code === 'ERR_NETWORK' || error.message === 'Network Error');

    if (isOffline) {
      notifyOffline();
      return Promise.reject(error);
    }

    if (response?.status === 429) {
      window.dispatchEvent(new CustomEvent('api-rate-limit', {
        detail: { message: response.data?.message || 'You are sending requests too quickly. Please slow down.' },
      }));
      return Promise.reject(error);
    }

    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { token } = refreshResponse.data.data;
        localStorage.setItem('philixmate_token', token);
        config.headers.Authorization = `Bearer ${token}`;
        return client(config);
      } catch (refreshError) {
        localStorage.removeItem('philixmate_token');
        localStorage.removeItem('philixmate_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    const delay = Math.pow(2, config.__retryCount) * (config.retryDelay || 1000);

    console.warn(`[API Client] Retry ${config.__retryCount}/${config.retry} for path ${config.url} after ${delay}ms`);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return client(config);
  }
);

export default client;
