import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const hideMyPostValidate = [body('postId').exists().isInt(), validateRequest]
export default hideMyPostValidate
