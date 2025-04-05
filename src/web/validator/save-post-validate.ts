import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const savePostValidate = [body('postId').exists().isInt().withMessage('postId must be Int'), validateRequest]
export default savePostValidate
