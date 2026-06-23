const { body, param, query, validationResult } = require('express-validator');

// Runs after the validator chains below; collects all errors into one clean response
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // surface the first error as the primary message
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Auth ---
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name is too long'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('gender').isIn(['male', 'female']).withMessage("Gender must be 'male' or 'female'"),
  body('favoriteGenres').optional().isArray().withMessage('favoriteGenres must be an array'),
  body('favoriteGenres.*').optional().isString().trim().isLength({ max: 30 }),
  validate,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  validate,
];

const resetPasswordRules = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// --- Rooms / Matching ---
const startMatchRules = [
  body('movie').trim().notEmpty().withMessage('Movie name is required').isLength({ max: 150 }),
  body('cinema').trim().notEmpty().withMessage('Cinema hall is required').isLength({ max: 150 }),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('time')
    .notEmpty()
    .withMessage('Show time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:mm format'),
  body('matchType').isIn(['solo', 'group']).withMessage("matchType must be 'solo' or 'group'"),
  body('intent').optional().isIn(['friendship', 'date']).withMessage("intent must be 'friendship' or 'date'"),
  body('womenOnly').optional().isBoolean().withMessage('womenOnly must be true or false'),
  validate,
];

const roomIdParamRules = [param('id').isMongoId().withMessage('Invalid room ID'), validate];

// --- Chat ---
const postMessageRules = [
  param('id').isMongoId().withMessage('Invalid room ID'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message text is required')
    .isLength({ max: 1000 })
    .withMessage('Message is too long (max 1000 characters)'),
  validate,
];

const getMessagesRules = [
  param('id').isMongoId().withMessage('Invalid room ID'),
  query('after').optional().isISO8601().withMessage('after must be a valid ISO date'),
  validate,
];

// --- Profile ---
const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be 1-50 characters'),
  body('age').optional().isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('favoriteGenres').optional().isArray().withMessage('favoriteGenres must be an array'),
  body('favoriteGenres.*').optional().isString().trim().isLength({ max: 30 }),
  body('profilePicture').optional().isString().isLength({ max: 2_000_000 }).withMessage('Image too large'),
  body('womenOnlyMode').optional().isBoolean().withMessage('womenOnlyMode must be true or false'),
  validate,
];

module.exports = {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  startMatchRules,
  roomIdParamRules,
  postMessageRules,
  getMessagesRules,
  updateProfileRules,
};
