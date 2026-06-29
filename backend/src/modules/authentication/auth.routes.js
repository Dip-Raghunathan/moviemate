const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');
const {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('./auth.validator');

router.post('/signup', signupRules, authController.signup);
router.post('/login', loginRules, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:sessionId', protect, authController.revokeSession);
router.delete('/sessions', protect, authController.revokeAllOtherSessions);

router.post('/forgot-password', forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, authController.resetPassword);

module.exports = router;
