const express = require('express');
const router = express.Router();
const matchingController = require('./matching.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { startMatchRules, roomIdParamRules } = require('./matching.validator');

router.use(protect);

router.post('/match', startMatchRules, matchingController.startMatch);
router.get('/my-room', matchingController.getMyRoom);
router.get('/unreviewed-room', matchingController.getUnreviewedRoom);
router.get('/vacant', matchingController.getVacantRooms);
router.get('/:id', roomIdParamRules, matchingController.getRoom);
router.post('/:id/join', roomIdParamRules, matchingController.joinRoom);
router.post('/:id/leave', roomIdParamRules, matchingController.leave);
router.post('/:id/ready', roomIdParamRules, matchingController.setReadyToChat);
router.post('/:id/leave-intro', roomIdParamRules, matchingController.leaveIntro);
router.put('/:id', roomIdParamRules, matchingController.updateRoom);
router.delete('/:id', roomIdParamRules, matchingController.deleteRoom);

module.exports = router;
