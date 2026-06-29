const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/user', reviewController.getUserReviews);
router.get('/', reviewController.getMovieReviews);
router.post('/', reviewController.create);
router.post('/:id/like', reviewController.like);
router.get('/:id/comments', reviewController.getComments);
router.post('/:id/comments', reviewController.postComment);

module.exports = router;
