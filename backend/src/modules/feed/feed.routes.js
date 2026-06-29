const express = require('express');
const router = express.Router();
const feedController = require('./feed.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/', feedController.getFeed);
router.get('/recommendations', feedController.getRecommendations);

module.exports = router;
