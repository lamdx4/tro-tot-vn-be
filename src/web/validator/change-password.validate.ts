import { body } from 'express-validator'

const changePasswordValidation = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required')
    .isLength({ min: 6 })
    .withMessage('Old password must be at least 6 characters long'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password must be different from old password')
      }
      return true
    })
]
export default changePasswordValidation
