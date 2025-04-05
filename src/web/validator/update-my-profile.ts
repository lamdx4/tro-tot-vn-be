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
  body('gender').notEmpty().withMessage("Invalid gender"),
  validateRequest
]
export default updateMyProfile