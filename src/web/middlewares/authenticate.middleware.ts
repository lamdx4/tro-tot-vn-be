import JWTService from '@/services/jwt.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'

export default function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const token =
    (req.headers['authorization']?.startsWith('Bearer ') ?? '')
      ? req.headers['authorization']?.split(' ')[1]
      : undefined
  if (!token) {
    res.status(401).json(ResponseData.unauthorized('Token is required'))
    return
  }
  const jwtService = new JWTService()
  const result = jwtService.verifyAccessToken(token)
  if (!result.isSuccess) {
    res.status(401).json(ResponseData.unauthorized('Invalid token'))
    return
  }
  req.user = result.getValue() ?? undefined
  next()
}
