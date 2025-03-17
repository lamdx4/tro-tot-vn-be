import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

export const forgotPasswordValidation = [body('email').isEmail().withMessage('Invalid email format'), validateRequest]

export const verifyOtpValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('otp').isNumeric().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number'),
  validateRequest
]

export const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/)
    .withMessage('Mật khẩu phải chứa ít nhất một chữ cái in hoa')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất một số'),
  validateRequest
]
