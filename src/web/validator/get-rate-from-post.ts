import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const getRateFromPostValidate = [param('postId').isNumeric().withMessage('POST_ID_MUST_BE_NUMERIC'), validateRequest]
export default getRateFromPostValidate
