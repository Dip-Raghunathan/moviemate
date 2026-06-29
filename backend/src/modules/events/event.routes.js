const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);

router.get('/', eventController.list);
router.post('/', eventController.create);
router.post('/:id/rsvp', eventController.rsvp);

module.exports = router;
