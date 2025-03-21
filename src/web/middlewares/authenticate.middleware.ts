import JWTService from '@/services/jwt.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'

export default function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json(ResponseData.unauthorized('Token is required'))
  }
  const jwtService = new JWTService()
  const result = jwtService.verifyAccessToken(token)
  if (!result.isSuccess) {
    return res.status(401).json(ResponseData.unauthorized('Invalid token'))
  }
  req.user = result.getValue() ?? undefined
  next()
}
