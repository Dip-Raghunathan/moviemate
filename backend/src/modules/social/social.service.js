const socialRepository = require('./social.repository');
const Notification = require('../../database/models/Notification');
const { sendNotification } = require('../../utils/notificationHelper');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

class SocialService {
  async getFriendsList(userId) {
    return socialRepository.findFriends(userId);
  }

  async getPendingRequests(userId) {
    const pending = await socialRepository.findPendingRequests(userId);
    const sent = await socialRepository.findSentRequests(userId);
    return { pending, sent };
  }

  async sendFriendRequest(senderId, receiverId) {
    if (senderId.toString() === receiverId.toString()) {
      throw new BadRequestError('Cannot send a friend request to yourself', 'SELF_FRIEND_REQUEST');
    }

    const existingFriendship = await socialRepository.findFriendship(senderId, receiverId);
    if (existingFriendship) {
      throw new BadRequestError('You are already friends', 'ALREADY_FRIENDS');
    }

    const existingRequest = await socialRepository.findFriendRequest(senderId, receiverId);
    if (existingRequest) {
      throw new BadRequestError('Friend request already sent', 'REQUEST_ALREADY_SENT');
    }

    // Auto-accept if they sent a request to us previously
    const reverseRequest = await socialRepository.findFriendRequest(receiverId, senderId);
    if (reverseRequest) {
      await socialRepository.deleteFriendRequest(reverseRequest._id);
      const friendship = await socialRepository.createFriendship(senderId, receiverId);
      
      // Notify receiver that friend request was accepted
      await sendNotification({
        recipient: receiverId,
        sender: senderId,
        type: 'friend_request',
        title: 'Friend Request Accepted',
        body: 'accepted your friend request!',
        deepLink: '/profile',
        priority: 'normal'
      });
      return friendship;
    }

    const request = await socialRepository.createFriendRequest(senderId, receiverId);

    // Create notification for recipient
    await sendNotification({
      recipient: receiverId,
      sender: senderId,
      type: 'friend_request',
      title: 'New Friend Request',
      body: 'sent you a friend request.',
      deepLink: '/profile',
      priority: 'normal'
    });

    return request;
  }

  async respondToFriendRequest(requestId, userId, accept) {
    const request = await socialRepository.findFriendRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Friend request not found', 'REQUEST_NOT_FOUND');
    }

    if (request.receiver.toString() !== userId.toString()) {
      throw new BadRequestError('This request was not sent to you', 'ACCESS_DENIED');
    }

    await socialRepository.deleteFriendRequest(requestId);

    if (accept) {
      const friendship = await socialRepository.createFriendship(request.sender, request.receiver);
      
      // Notify sender that their request was accepted
      await sendNotification({
        recipient: request.sender,
        sender: userId,
        type: 'friend_request',
        title: 'Friend Request Accepted',
        body: 'accepted your friend request!',
        deepLink: '/profile',
        priority: 'normal'
      });

      return friendship;
    }

    return { declined: true };
  }

  async removeFriend(userId, friendId) {
    const friendship = await socialRepository.findFriendship(userId, friendId);
    if (!friendship) {
      throw new BadRequestError('You are not friends with this user', 'NOT_FRIENDS');
    }
    await socialRepository.removeFriendship(userId, friendId);
    return { success: true };
  }

  async followUser(userId, followeeId) {
    if (userId.toString() === followeeId.toString()) {
      throw new BadRequestError('Cannot follow yourself', 'SELF_FOLLOW');
    }
    const existing = await socialRepository.findFollower(followeeId, userId);
    if (existing) {
      throw new BadRequestError('Already following this user', 'ALREADY_FOLLOWING');
    }

    const follow = await socialRepository.createFollower(followeeId, userId);

    // Notify followee
    await sendNotification({
      recipient: followeeId,
      sender: userId,
      type: 'friend_request',
      title: 'New Follower',
      body: 'started following you.',
      deepLink: '/profile',
      priority: 'normal'
    });

    return follow;
  }

  async unfollowUser(userId, followeeId) {
    const existing = await socialRepository.findFollower(followeeId, userId);
    if (!existing) {
      throw new BadRequestError('Not following this user', 'NOT_FOLLOWING');
    }
    await socialRepository.removeFollower(followeeId, userId);
    return { success: true };
  }

  async getFollowCounts(userId) {
    const followings = await socialRepository.findFollowings(userId);
    const followers = await socialRepository.findFollowers(userId);
    return {
      followingCount: followings.length,
      followerCount: followers.length,
      followings,
      followers,
    };
  }

  async getNotifications(userId) {
    return Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profilePicture isPro');
  }

  async markNotificationRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { status: 'read' },
      { new: true }
    );
    if (!notification) {
      throw new NotFoundError('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  }

  async markAllNotificationsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, status: 'unread' },
      { status: 'read' }
    );
    return { success: true };
  }

  async deleteNotification(notificationId, userId) {
    const result = await Notification.deleteOne({ _id: notificationId, recipient: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return { success: true };
  }

  async clearAllNotifications(userId) {
    await Notification.deleteMany({ recipient: userId });
    return { success: true };
  }
}

module.exports = new SocialService();
