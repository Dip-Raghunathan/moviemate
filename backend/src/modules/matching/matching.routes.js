const express = require('express');
const router = express.Router();
const matchingController = require('./matching.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { startMatchRules, roomIdParamRules } = require('./matching.validator');

router.use(protect);

router.post('/match', startMatchRules, matchingController.startMatch);
router.get('/my-room', matchingController.getMyRoom);
router.get('/vacant', matchingController.getVacantRooms);
router.get('/:id', roomIdParamRules, matchingController.getRoom);
router.post('/:id/join', roomIdParamRules, matchingController.joinRoom);
router.post('/:id/leave', roomIdParamRules, matchingController.leave);

module.exports = router;
