const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { updateProfileRules } = require('./user.validator');

router.use(protect);

router.get('/me', userController.getProfile);
router.put('/me', updateProfileRules, userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.get('/:id', userController.getPublicProfile);

module.exports = router;
