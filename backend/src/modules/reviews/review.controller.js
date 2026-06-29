const reviewService = require('./review.service');

class ReviewController {
  getMovieReviews = async (req, res, next) => {
    try {
      const list = await reviewService.getMovieReviews(req.query.movie);
      return res.success(list, 'Movie reviews fetched');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const review = await reviewService.publishReview(req.user._id, req.body);
      res.statusCode = 201;
      return res.success(review, 'Review published successfully');
    } catch (error) {
      next(error);
    }
  };

  like = async (req, res, next) => {
    try {
      const result = await reviewService.likeReview(req.user._id, req.params.id);
      return res.success(result, 'Review like toggled');
    } catch (error) {
      next(error);
    }
  };

  getComments = async (req, res, next) => {
    try {
      const list = await reviewService.getComments(req.params.id);
      return res.success(list, 'Review comments fetched');
    } catch (error) {
      next(error);
    }
  };

  postComment = async (req, res, next) => {
    try {
      const { text } = req.body;
      const comment = await reviewService.postComment(req.user._id, req.params.id, text);
      res.statusCode = 201;
      return res.success(comment, 'Comment posted successfully');
    } catch (error) {
      next(error);
    }
  };

  getUserReviews = async (req, res, next) => {
    try {
      const list = await reviewService.getUserReviews(req.user._id);
      return res.success(list, 'User reviews fetched');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ReviewController();
