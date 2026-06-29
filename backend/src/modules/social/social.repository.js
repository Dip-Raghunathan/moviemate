const { Friend, FriendRequest, Follower } = require('../../database/models/Social');
const User = require('../../database/models/User');

class SocialRepository {
  async findFriendship(u1, u2) {
    const user1 = u1.toString() < u2.toString() ? u1 : u2;
    const user2 = u1.toString() < u2.toString() ? u2 : u1;
    return Friend.findOne({ user1, user2 });
  }

  async createFriendship(u1, u2) {
    const user1 = u1.toString() < u2.toString() ? u1 : u2;
    const user2 = u1.toString() < u2.toString() ? u2 : u1;
    return Friend.create({ user1, user2, status: 'friends' });
  }

  async removeFriendship(u1, u2) {
    const user1 = u1.toString() < u2.toString() ? u1 : u2;
    const user2 = u1.toString() < u2.toString() ? u2 : u1;
    return Friend.findOneAndDelete({ user1, user2 });
  }

  async findFriends(userId) {
    const friendships = await Friend.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'friends',
    }).populate('user1 user2', 'name profilePicture isPro gender');

    return friendships.map((f) => {
      const other = f.user1._id.toString() === userId.toString() ? f.user2 : f.user1;
      return {
        id: other._id,
        name: other.name,
        profilePicture: other.profilePicture,
        isPro: other.isPro,
        gender: other.gender,
      };
    });
  }

  async findPendingRequests(userId) {
    return FriendRequest.find({ receiver: userId, status: 'pending' }).populate('sender', 'name profilePicture isPro gender');
  }

  async findSentRequests(userId) {
    return FriendRequest.find({ sender: userId, status: 'pending' }).populate('receiver', 'name profilePicture isPro gender');
  }

  async findFriendRequest(sender, receiver) {
    return FriendRequest.findOne({ sender, receiver });
  }

  async createFriendRequest(sender, receiver) {
    return FriendRequest.create({ sender, receiver, status: 'pending' });
  }

  async findFriendRequestById(requestId) {
    return FriendRequest.findById(requestId);
  }

  async deleteFriendRequest(requestId) {
    return FriendRequest.findByIdAndDelete(requestId);
  }

  async findFollower(userId, followerId) {
    return Follower.findOne({ user: userId, follower: followerId });
  }

  async createFollower(userId, followerId) {
    return Follower.create({ user: userId, follower: followerId });
  }

  async removeFollower(userId, followerId) {
    return Follower.findOneAndDelete({ user: userId, follower: followerId });
  }

  async findFollowings(userId) {
    const follows = await Follower.find({ follower: userId }).populate('user', 'name profilePicture isPro gender');
    return follows.map((f) => f.user);
  }

  async findFollowers(userId) {
    const follows = await Follower.find({ user: userId }).populate('follower', 'name profilePicture isPro gender');
    return follows.map((f) => f.follower);
  }
}

module.exports = new SocialRepository();
