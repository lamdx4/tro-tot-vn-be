import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const editPostValidator = [param('postId').exists().withMessage('postId must be existed').toInt(), validateRequest]
export default editPostValidator
