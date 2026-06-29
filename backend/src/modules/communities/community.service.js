const communityRepository = require('./community.repository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

class CommunityService {
  async getPublicCommunities() {
    return communityRepository.findAllPublic();
  }

  async getUserCommunities(userId) {
    return communityRepository.findUserCommunities(userId);
  }

  async getCommunityDetails(communityId, userId) {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundError('Community not found', 'COMMUNITY_NOT_FOUND');
    }

    // Optional membership checks for private groups
    const member = await communityRepository.findMember(userId, communityId);
    const isMember = !!member;

    if (community.privacy === 'private' && !isMember) {
      throw new ForbiddenError('This community is private', 'PRIVATE_COMMUNITY');
    }

    const members = await communityRepository.findMembers(communityId);

    return {
      community,
      isMember,
      role: member ? member.role : null,
      members,
    };
  }

  async createCommunity(ownerId, data) {
    const { name, description, privacy, avatar, cover, rules } = data;

    const existing = await communityRepository.findByName(name);
    if (existing) {
      throw new BadRequestError('Community name is already taken', 'NAME_TAKEN');
    }

    const community = await communityRepository.createCommunity({
      name,
      description,
      privacy: privacy || 'public',
      avatar,
      cover,
      rules: Array.isArray(rules) ? rules : [],
      owner: ownerId,
    });

    // Auto-join owner as community owner member
    await communityRepository.createMember({
      user: ownerId,
      community: community._id,
      role: 'owner',
    });

    return community;
  }

  async joinCommunity(userId, communityId) {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundError('Community not found', 'COMMUNITY_NOT_FOUND');
    }

    if (community.privacy === 'invite-only') {
      throw new ForbiddenError('This community requires an invitation to join', 'INVITE_ONLY_COMMUNITY');
    }

    const existing = await communityRepository.findMember(userId, communityId);
    if (existing) {
      return existing;
    }

    return communityRepository.createMember({
      user: userId,
      community: communityId,
      role: 'member',
    });
  }

  async leaveCommunity(userId, communityId) {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new NotFoundError('Community not found', 'COMMUNITY_NOT_FOUND');
    }

    if (community.owner.toString() === userId.toString()) {
      throw new BadRequestError('Community owners cannot leave. You must transfer ownership first or delete the community.', 'OWNER_LEAVE_BLOCKED');
    }

    const member = await communityRepository.findMember(userId, communityId);
    if (!member) {
      throw new BadRequestError('You are not a member of this community', 'NOT_COMMUNITY_MEMBER');
    }

    await communityRepository.removeMember(userId, communityId);
    return { success: true };
  }

  async getChannelMessages(channelId, userId, communityId, after = null) {
    const member = await communityRepository.findMember(userId, communityId);
    if (!member) {
      throw new ForbiddenError('You must join the community to view channel messages', 'NOT_COMMUNITY_MEMBER');
    }
    return communityRepository.findChannelMessages(channelId, after);
  }

  async postChannelMessage(channelId, userId, userName, communityId, text) {
    const member = await communityRepository.findMember(userId, communityId);
    if (!member) {
      throw new ForbiddenError('You must join the community to send channel messages', 'NOT_COMMUNITY_MEMBER');
    }
    return communityRepository.createChannelMessage(channelId, userId, userName, text);
  }
}

module.exports = new CommunityService();
