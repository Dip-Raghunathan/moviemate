const { Review, Comment } = require('../../database/models/Review');
const { ConflictError, NotFoundError } = require('../../utils/errors');

class ReviewService {
  async getMovieReviews(movieName) {
    return Review.find({ movie: movieName, status: 'active' })
      .populate('user', 'name profilePicture isPro')
      .sort({ createdAt: -1 });
  }

  async publishReview(userId, data) {
    const { movie, rating, text } = data;

    const existing = await Review.findOne({ movie, user: userId });
    if (existing) {
      throw new ConflictError('You have already reviewed this movie', 'ALREADY_REVIEWED');
    }

    return Review.create({
      movie,
      user: userId,
      rating,
      text,
    });
  }

  async likeReview(userId, reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found', 'REVIEW_NOT_FOUND');
    }

    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      review.likes.push(userId);
    }

    await review.save();
    return { liked: !hasLiked, likesCount: review.likes.length };
  }

  async getComments(reviewId) {
    return Comment.find({ review: reviewId })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: 1 });
  }

  async postComment(userId, reviewId, text) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found', 'REVIEW_NOT_FOUND');
    }

    return Comment.create({
      review: reviewId,
      user: userId,
      text,
    });
  }

  async getUserReviews(userId) {
    return Review.find({ user: userId }).sort({ createdAt: -1 });
  }
}

module.exports = new ReviewService();
