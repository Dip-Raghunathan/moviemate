const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { getMessagesRules, postMessageRules } = require('./chat.validator');

router.use(protect);

router.get('/:id/messages', getMessagesRules, chatController.getMessages);
router.post('/:id/messages', postMessageRules, chatController.postMessage);

module.exports = router;
