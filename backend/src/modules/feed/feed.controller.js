const feedService = require('./feed.service');

class FeedController {
  getFeed = async (req, res, next) => {
    try {
      const feed = await feedService.getGlobalFeed();
      return res.success(feed, 'Social activity feed loaded');
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req, res, next) => {
    try {
      const recommendations = await feedService.getRecommendations(req.user);
      return res.success(recommendations, 'Personalized recommendations loaded');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FeedController();
