const communityService = require('./community.service');

class CommunityController {
  listPublic = async (req, res, next) => {
    try {
      const list = await communityService.getPublicCommunities();
      return res.success(list, 'Public communities fetched');
    } catch (error) {
      next(error);
    }
  };

  listMy = async (req, res, next) => {
    try {
      const list = await communityService.getUserCommunities(req.user._id);
      return res.success(list, 'User joined communities fetched');
    } catch (error) {
      next(error);
    }
  };

  getDetails = async (req, res, next) => {
    try {
      const result = await communityService.getCommunityDetails(req.params.id, req.user._id);
      return res.success(result, 'Community details fetched');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const community = await communityService.createCommunity(req.user._id, req.body);
      res.statusCode = 201;
      return res.success(community, 'Community created successfully');
    } catch (error) {
      next(error);
    }
  };

  join = async (req, res, next) => {
    try {
      const result = await communityService.joinCommunity(req.user._id, req.params.id);
      return res.success(result, 'Joined community successfully');
    } catch (error) {
      next(error);
    }
  };

  leave = async (req, res, next) => {
    try {
      const result = await communityService.leaveCommunity(req.user._id, req.params.id);
      return res.success(result, 'Left community successfully');
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req, res, next) => {
    try {
      const { id: communityId, channelId } = req.params;
      const list = await communityService.getChannelMessages(channelId, req.user._id, communityId, req.query.after);
      return res.success(list, 'Channel messages loaded');
    } catch (error) {
      next(error);
    }
  };

  postMessage = async (req, res, next) => {
    try {
      const { id: communityId, channelId } = req.params;
      const { text } = req.body;
      const msg = await communityService.postChannelMessage(channelId, req.user._id, req.user.name, communityId, text);
      res.statusCode = 201;
      return res.success(msg, 'Channel message sent');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CommunityController();
