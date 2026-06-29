const express = require('express');
const router = express.Router();
const engagementController = require('./engagement.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/stats', engagementController.getData);
router.post('/checkin', engagementController.checkIn);

module.exports = router;
