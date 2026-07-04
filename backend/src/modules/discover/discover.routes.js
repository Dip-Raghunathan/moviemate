const express = require('express');
const router = express.Router();
const discoverController = require('./discover.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/', discoverController.getDiscoverFeed);
router.post('/notes', discoverController.postNote);

module.exports = router;
