const express = require('express');
const router = express.Router();
const communityController = require('./community.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/public', communityController.listPublic);
router.get('/my', communityController.listMy);
router.post('/', communityController.create);

router.get('/:id', communityController.getDetails);
router.post('/:id/join', communityController.join);
router.post('/:id/leave', communityController.leave);

// Channel message polling endpoints
router.get('/:id/channels/:channelId/messages', communityController.getMessages);
router.post('/:id/channels/:channelId/messages', communityController.postMessage);

module.exports = router;
