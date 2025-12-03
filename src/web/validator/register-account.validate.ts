import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const validateRegister = [
  // Validate phone
  body('phone')
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không đúng định dạng Việt Nam')
    .trim(),

  // Validate email
  body('email')
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không đúng định dạng')
    .normalizeEmail(),

  // Validate firstName
  body('firstName')
    .notEmpty().withMessage('Họ không được để trống')
    .isString().withMessage('Họ phải là chuỗi ký tự')
    .isLength({ min: 1, max: 30 }).withMessage('Họ phải từ 1-30 ký tự')
    .trim(),

  // Validate lastName
  body('lastName')
    .notEmpty().withMessage('Tên không được để trống')
    .isString().withMessage('Tên phải là chuỗi ký tự')
    .isLength({ min: 1, max: 30 }).withMessage('Tên phải từ 1-30 ký tự')
    .trim(),

  // Validate birthday (optional)
  body('birthday')
    .optional({ nullable: true })
    .isISO8601().withMessage('Ngày sinh không đúng định dạng')
    .custom((value) => {
      if (value) {
        const date = new Date(value)
        if (date >= new Date()) {
          throw new Error('Ngày sinh phải là ngày trong quá khứ')
        }
      }
      return true
    }),

  // Validate gender
  body('gender')
    .notEmpty().withMessage('Giới tính không được để trống')
    .isIn(['Male', 'Female']).withMessage('Giới tính chỉ có thể là Male hoặc Female'),

  // Validate password
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa ít nhất một chữ in hoa')
    .matches(/[a-z]/).withMessage('Mật khẩu phải chứa ít nhất một chữ thường')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất một chữ số'),

  validateRequest
]

export default validateRegister
