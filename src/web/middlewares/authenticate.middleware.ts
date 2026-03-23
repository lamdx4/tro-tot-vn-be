import AuthService from '@/services/auth.service'
import JWTService from '@/services/jwt.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'

export default async function authenticateMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token =
    (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : undefined

  if (!token) {
    res.status(401).json(ResponseData.unauthorized('Token is required'))
    return
  }

  const jwtService = new JWTService()
  const result = jwtService.verifyAccessTokenDetailed(token)

  if (!result.isValid) {
    // Expired tokens → 403 Forbidden; malformed / invalid → 401 Unauthorized
    const status = result.isExpired ? 403 : 401
    res.status(status).json(
      status === 403
        ? ResponseData.failure(403, 'TOKEN_EXPIRED', result.errorMessage ?? 'Token has expired')
        : ResponseData.unauthorized(result.errorMessage ?? 'Invalid token')
    )
    return
  }

  req.user = result.payload ?? undefined
  const authService = new AuthService()
  const isActiveAccount = await authService.isActiveAccount(req.user!.accountId)
  if (!isActiveAccount.isSuccess) {
    res.status(423).json(ResponseData.failure(423, 'ACCOUNT_NOT_ACTIVE', 'Account is not active'))
    return
  }
  next()
}
