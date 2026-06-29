const { Community, CommunityMember } = require('../../database/models/Community');
const Message = require('../../database/models/Message');

class CommunityRepository {
  async findByName(name) {
    return Community.findOne({ name });
  }

  async findById(id) {
    return Community.findById(id).populate('owner', 'name profilePicture');
  }

  async createCommunity(communityData) {
    return Community.create(communityData);
  }

  async createMember(memberData) {
    return CommunityMember.create(memberData);
  }

  async findMember(userId, communityId) {
    return CommunityMember.findOne({ user: userId, community: communityId });
  }

  async findMembers(communityId) {
    return CommunityMember.find({ community: communityId }).populate('user', 'name profilePicture isPro gender');
  }

  async findUserCommunities(userId) {
    const memberships = await CommunityMember.find({ user: userId }).populate('community');
    return memberships.map((m) => m.community).filter(Boolean);
  }

  async findAllPublic() {
    return Community.find({ privacy: 'public', isArchived: false });
  }

  async removeMember(userId, communityId) {
    return CommunityMember.findOneAndDelete({ user: userId, community: communityId });
  }

  async createChannelMessage(channelId, senderId, senderName, text) {
    return Message.create({
      room: channelId,
      sender: senderId,
      senderName,
      text,
      isSystem: false,
    });
  }

  async findChannelMessages(channelId, after = null, limit = 100) {
    const query = { room: channelId };
    if (after) {
      query.createdAt = { $gt: new Date(after) };
    }
    return Message.find(query).sort({ createdAt: 1 }).limit(limit);
  }
}

module.exports = new CommunityRepository();
