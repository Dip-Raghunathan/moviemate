const socialService = require('./social.service');

class SocialController {
  getFriends = async (req, res, next) => {
    try {
      const friends = await socialService.getFriendsList(req.user._id);
      return res.success(friends, 'Friends list retrieved');
    } catch (error) {
      next(error);
    }
  };

  getRequests = async (req, res, next) => {
    try {
      const requests = await socialService.getPendingRequests(req.user._id);
      return res.success(requests, 'Pending requests retrieved');
    } catch (error) {
      next(error);
    }
  };

  sendRequest = async (req, res, next) => {
    try {
      const { receiverId } = req.body;
      const result = await socialService.sendFriendRequest(req.user._id, receiverId);
      return res.success(result, 'Friend request processed');
    } catch (error) {
      next(error);
    }
  };

  respondRequest = async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const { accept } = req.body;
      const result = await socialService.respondToFriendRequest(requestId, req.user._id, accept);
      return res.success(result, accept ? 'Request accepted' : 'Request declined');
    } catch (error) {
      next(error);
    }
  };

  removeFriend = async (req, res, next) => {
    try {
      const { friendId } = req.params;
      const result = await socialService.removeFriend(req.user._id, friendId);
      return res.success(result, 'Friend removed successfully');
    } catch (error) {
      next(error);
    }
  };

  follow = async (req, res, next) => {
    try {
      const { followeeId } = req.body;
      const result = await socialService.followUser(req.user._id, followeeId);
      return res.success(result, 'User followed successfully');
    } catch (error) {
      next(error);
    }
  };

  unfollow = async (req, res, next) => {
    try {
      const { followeeId } = req.params;
      const result = await socialService.unfollowUser(req.user._id, followeeId);
      return res.success(result, 'User unfollowed successfully');
    } catch (error) {
      next(error);
    }
  };

  getFollowCounts = async (req, res, next) => {
    try {
      const result = await socialService.getFollowCounts(req.user._id);
      return res.success(result, 'Follow data retrieved');
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req, res, next) => {
    try {
      const notifications = await socialService.getNotifications(req.user._id);
      return res.success(notifications, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  };

  markNotificationRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await socialService.markNotificationRead(id, req.user._id);
      return res.success(result, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  markAllNotificationsRead = async (req, res, next) => {
    try {
      const result = await socialService.markAllNotificationsRead(req.user._id);
      return res.success(result, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await socialService.deleteNotification(id, req.user._id);
      return res.success(result, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  clearAllNotifications = async (req, res, next) => {
    try {
      const result = await socialService.clearAllNotifications(req.user._id);
      return res.success(result, 'All notifications cleared successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new SocialController();
