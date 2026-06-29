import api from './api';

export const getMovieReviews = async (movieName) => {
  const res = await api.get(`/reviews?movie=${encodeURIComponent(movieName)}`);
  return res.data;
};

export const getUserReviews = async () => {
  const res = await api.get('/reviews/user');
  return res.data;
};

export const createReview = async (data) => {
  const res = await api.post('/reviews', data);
  return res.data;
};

export const likeReview = async (id) => {
  const res = await api.post(`/reviews/${id}/like`);
  return res.data;
};

export const getComments = async (reviewId) => {
  const res = await api.get(`/reviews/${reviewId}/comments`);
  return res.data;
};

export const postComment = async (reviewId, text) => {
  const res = await api.post(`/reviews/${reviewId}/comments`, { text });
  return res.data;
};
