const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { updateProfileRules } = require('../middleware/validators');

router.use(protect);

router.get('/me', getProfile);
router.put('/me', updateProfileRules, updateProfile);

module.exports = router;
