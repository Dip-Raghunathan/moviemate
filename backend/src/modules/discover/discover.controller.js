const discoverService = require('./discover.service');

class DiscoverController {
  getDiscoverFeed = async (req, res, next) => {
    try {
      const feed = await discoverService.getDiscoverFeed();
      return res.success(feed, 'Discover feed retrieved');
    } catch (error) {
      next(error);
    }
  };

  postNote = async (req, res, next) => {
    try {
      const note = await discoverService.postNote(req.user.name, req.body.text);
      return res.success({ note }, 'Note posted to community billboard');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DiscoverController();
