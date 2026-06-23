const express = require('express');
const router = express.Router();
const { signup, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validators');

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordRules, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, resetPassword);

module.exports = router;
