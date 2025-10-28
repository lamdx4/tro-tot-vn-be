import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const updateMyProfile = [
  body('firstName')
    .notEmpty()
    .withMessage('FIRST_NAME_REQUIRED')
    .isString()
    .withMessage('FIRST_NAME_MUST_BE_STRING')
    .isLength({ min: 2, max: 50 })
    .withMessage('FIRST_NAME_LENGTH_INVALID'),
  body('lastName')
    .notEmpty()
    .withMessage('LAST_NAME_REQUIRED')
    .isString()
    .withMessage('LAST_NAME_MUST_BE_STRING')
    .isLength({ min: 2, max: 50 })
    .withMessage('LAST_NAME_LENGTH_INVALID'),
  body('email')
    .notEmpty()
    .withMessage('EMAIL_REQUIRED')
    .isEmail()
    .withMessage('EMAIL_INVALID')
    .isLength({ min: 5, max: 100 })
    .withMessage('EMAIL_LENGTH_INVALID'),
  body('gender').notEmpty().withMessage('Invalid gender'),
  body('currentCity')
    .optional()
    .isString()
    .withMessage('CURRENT_CITY_MUST_BE_STRING')
    .isLength({ max: 100 })
    .withMessage('CURRENT_CITY_TOO_LONG'),
  body('currentDistrict')
    .optional()
    .isString()
    .withMessage('CURRENT_DISTRICT_MUST_BE_STRING')
    .isLength({ max: 100 })
    .withMessage('CURRENT_DISTRICT_TOO_LONG'),
  body('currentJob')
    .optional()
    .isString()
    .withMessage('CURRENT_JOB_MUST_BE_STRING')
    .isIn(['Student', 'Employed'])
    .withMessage('CURRENT_JOB_INVALID'),
  validateRequest
]
export default updateMyProfile