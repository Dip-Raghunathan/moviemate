const express = require('express');
const router = express.Router();
const socialController = require('./social.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/friends', socialController.getFriends);
router.get('/requests', socialController.getRequests);
router.post('/requests', socialController.sendRequest);
router.post('/requests/:requestId', socialController.respondRequest);
router.delete('/friends/:friendId', socialController.removeFriend);

router.post('/follow', socialController.follow);
router.delete('/follow/:followeeId', socialController.unfollow);
router.get('/follow/counts', socialController.getFollowCounts);

router.get('/notifications', socialController.getNotifications);
router.post('/notifications/:id/read', socialController.markNotificationRead);
router.post('/notifications/read-all', socialController.markAllNotificationsRead);
router.delete('/notifications/:id', socialController.deleteNotification);
router.delete('/notifications', socialController.clearAllNotifications);

module.exports = router;
