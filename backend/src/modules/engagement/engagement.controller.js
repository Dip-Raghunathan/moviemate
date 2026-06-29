const engagementService = require('./engagement.service');

class EngagementController {
  getData = async (req, res, next) => {
    try {
      const data = await engagementService.getEngagementData(req.user._id);
      return res.success(data, 'Engagement statistics retrieved');
    } catch (error) {
      next(error);
    }
  };

  checkIn = async (req, res, next) => {
    try {
      const result = await engagementService.checkIn(req.user._id);
      return res.success(result, 'Daily login check-in processed');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new EngagementController();
