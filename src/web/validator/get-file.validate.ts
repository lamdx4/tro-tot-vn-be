import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

export const getFileValidate = [param('fileId').isString().isLength({ min: 1 }), validateRequest]
