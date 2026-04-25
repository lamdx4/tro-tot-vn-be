import { Request } from 'express'
import JWTService from '@/services/jwt.service'
import AuthService from '@/services/auth.service'

/**
 * TSOA authentication handler
 * @param request - Express Request
 * @param securityName - Name of the security definition (e.g., 'jwt')
 * @param scopes - Required scopes (e.g., ['ADMIN'])
 */
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const authHeader = request.headers['authorization']
    const token =
      (authHeader && authHeader.startsWith('Bearer '))
        ? authHeader.split(' ')[1]
        : undefined

    if (!token) {
      throw new Error('Token is required')
    }

    const jwtService = new JWTService()
    const result = jwtService.verifyAccessTokenDetailed(token)

    if (!result.isValid) {
      if (result.isExpired) {
        throw { status: 403, message: 'Token has expired' }
      }
      throw { status: 401, message: 'Invalid token' }
    }

    const payload = result.payload
    if (!payload) {
      throw { status: 401, message: 'Invalid token payload' }
    }

    // Check account activity
    const authService = new AuthService()
    const isActiveAccount = await authService.isActiveAccount(payload.accountId)
    if (!isActiveAccount.isSuccess) {
      throw { status: 423, message: 'Account is not active' }
    }

    // Role-based Authorization (Scopes)
    if (scopes && scopes.length > 0) {
      const userRole = payload.role?.roleName
      if (!userRole || !scopes.includes(userRole)) {
        throw { status: 403, message: 'Insufficient permissions' }
      }
    }

    return payload
  }

  return Promise.reject(new Error('Unknown security name'))
}
