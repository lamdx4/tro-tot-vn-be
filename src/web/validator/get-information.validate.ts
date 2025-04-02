import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const validateGetInformation = [param('customerId').exists().isInt().withMessage('CUSTOMER_ID_IS_REQUIRED'), validateRequest]
export default validateGetInformation