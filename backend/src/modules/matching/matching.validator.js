const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw new ValidationError(errorDetails, errors.array()[0].msg);
  }
  next();
};

const startMatchRules = [
  body('movie').trim().notEmpty().withMessage('Movie name is required').isLength({ max: 150 }),
  body('cinema').trim().notEmpty().withMessage('Cinema hall is required').isLength({ max: 150 }),
  body('city').trim().notEmpty().withMessage('City is required').isLength({ max: 150 }),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('showTiming')
    .notEmpty()
    .withMessage('Show timing is required')
    .isIn(['Morning Show', 'Afternoon Show', 'Evening Show', 'Night Show'])
    .withMessage('Invalid show timing option'),
  body('matchType').isIn(['solo', 'group']).withMessage("matchType must be 'solo' or 'group'"),
  body('intent').optional().isIn(['friendship', 'date']).withMessage("intent must be 'friendship' or 'date'"),
  body('womenOnly').optional().isBoolean().withMessage('womenOnly must be true or false'),
  validate,
];

const roomIdParamRules = [param('id').isMongoId().withMessage('Invalid room ID'), validate];

module.exports = {
  startMatchRules,
  roomIdParamRules,
};
