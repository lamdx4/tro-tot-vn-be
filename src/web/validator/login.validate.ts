import { body } from 'express-validator'
import validateExpressRequest from '../middlewares/validate.middleware'

const validateLogin = [body('identifier').notEmpty(), body('password').notEmpty(), validateExpressRequest]
export default validateLogin