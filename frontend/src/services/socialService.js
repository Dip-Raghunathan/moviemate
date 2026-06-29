import api from './api';

export const getFriends = async () => {
  const res = await api.get('/social/friends');
  return res.data;
};

export const getRequests = async () => {
  const res = await api.get('/social/requests');
  return res.data;
};

export const sendFriendRequest = async (receiverId) => {
  const res = await api.post('/social/requests', { receiverId });
  return res.data;
};

export const respondFriendRequest = async (requestId, accept) => {
  const res = await api.post(`/social/requests/${requestId}`, { accept });
  return res.data;
};

export const removeFriend = async (friendId) => {
  const res = await api.delete(`/social/friends/${friendId}`);
  return res.data;
};

export const followUser = async (followeeId) => {
  const res = await api.post('/social/follow', { followeeId });
  return res.data;
};

export const unfollowUser = async (followeeId) => {
  const res = await api.delete(`/social/follow/${followeeId}`);
  return res.data;
};

export const getFollowCounts = async () => {
  const res = await api.get('/social/follow/counts');
  return res.data;
};

export const getNotifications = async () => {
  const res = await api.get('/social/notifications');
  return res.data;
};

export const markNotificationRead = async (notificationId) => {
  const res = await api.post(`/social/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.post('/social/notifications/read-all');
  return res.data;
};
