import { body } from 'express-validator'

const createAppointmentValidate = [
  body('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  body('appointmentAt')
    .exists()
    .withMessage('APPOINTMENT_AT_IS_REQUIRED')
    .isDate()
    .withMessage('APPOINTMENT_AT_IS_INVALID'),
  body('appointmentAt').custom((value, { req }) => {
    const appointmentAt = new Date(value)
    const now = new Date()
    if (appointmentAt < now) {
      throw new Error('APPOINTMENT_AT_MUST_BE_IN_FUTURE')
    }
    return true
  }),
  body('appointmentAt').custom((value, { req }) => {
    const appointmentAt = new Date(value)
    const now = new Date()
    const diffInHours = (appointmentAt.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 1) {
      throw new Error('APPOINTMENT_AT_MUST_BE_AT_LEAST_1_HOUR_AHEAD')
    }
    return true
  })
]
