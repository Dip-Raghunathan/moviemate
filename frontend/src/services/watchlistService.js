import api from './api';

export const getWatchlist = async () => {
  const res = await api.get('/watchlist');
  return res.data?.data || res.data;
};

export const saveMovie = async (movieName) => {
  const res = await api.post('/watchlist', { movieName });
  return res.data?.data || res.data;
};

export const deleteMovie = async (id) => {
  const res = await api.delete(`/watchlist/${id}`);
  return res.data?.data || res.data;
};

export const getSuggestions = async (q) => {
  const res = await api.get('/watchlist/suggest', { params: { q } });
  return res.data?.data || res.data;
};
