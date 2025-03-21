import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const validateLogin = [body('identifier').notEmpty(), body('password').notEmpty(), validateRequest]
export default validateLogin