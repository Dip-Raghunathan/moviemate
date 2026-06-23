const express = require('express');
const router = express.Router();
const { startMatch, getRoom, getMyRoom, leave } = require('../controllers/roomController');
const { getMessages, postMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const {
  startMatchRules,
  roomIdParamRules,
  postMessageRules,
  getMessagesRules,
} = require('../middleware/validators');

router.use(protect); // every room route requires auth

router.post('/match', startMatchRules, startMatch);
router.get('/my-room', getMyRoom);
router.get('/:id', roomIdParamRules, getRoom);
router.post('/:id/leave', roomIdParamRules, leave);

// Chat (polling-based)
router.get('/:id/messages', getMessagesRules, getMessages);
router.post('/:id/messages', postMessageRules, postMessage);

module.exports = router;
