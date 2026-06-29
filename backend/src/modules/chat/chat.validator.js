const { body, param, query, validationResult } = require('express-validator');
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

module.exports = {
  postMessageRules,
  getMessagesRules,
};
