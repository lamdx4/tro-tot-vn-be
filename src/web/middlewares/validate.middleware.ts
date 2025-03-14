import ResponseData from '@/utils/response'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

const validateExpressRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json(new ResponseData(400, 'Validation failed', errors.array()))
    return
  }
  next()
}
export default validateExpressRequest
