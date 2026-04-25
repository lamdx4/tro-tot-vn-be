import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { ConfigService } from './config.service'
import { Result } from '@/utils/data-types/result'
import { Account } from '@/domains/entities/account.entity'

export enum TokenErrorCode {
  MISSING = 'TOKEN_MISSING',
  INVALID = 'TOKEN_INVALID',
  EXPIRED = 'TOKEN_EXPIRED'
}

export interface TokenVerifyResult {
  isValid: boolean
  isExpired: boolean
  payload?: Account
  errorCode?: TokenErrorCode
  errorMessage?: string
}

export default class JWTService {
  private configService: ConfigService

  constructor() {
    this.configService = ConfigService.gI()
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'), {
      expiresIn: parseInt(this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRES_IN'))
    })
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'), {
      expiresIn: parseInt(this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES_IN'))
    })
  }

  /**
   * Verify an access token and return detailed result including expiry detection.
   * This method does NOT throw; it always returns a structured result.
   */
  verifyAccessTokenDetailed(token: string): TokenVerifyResult {
    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        errorCode: TokenErrorCode.MISSING,
        errorMessage: 'TOKEN_REQUIRED'
      }
    }
    try {
      const payload = jwt.verify(token, this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET')) as Account
      if (typeof payload === 'string') {
        return {
          isValid: false,
          isExpired: false,
          errorCode: TokenErrorCode.INVALID,
          errorMessage: 'INVALID_TOKEN'
        }
      }
      return { isValid: true, isExpired: false, payload }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // Decode token to extract payload even when expired (for customerId lookup)
        const decoded = jwt.decode(token) as Account | null
        return {
          isValid: false,
          isExpired: true,
          payload: decoded ?? undefined,
          errorCode: TokenErrorCode.EXPIRED,
          errorMessage: 'TOKEN_EXPIRED'
        }
      }
      if (error instanceof JsonWebTokenError) {
        return {
          isValid: false,
          isExpired: false,
          errorCode: TokenErrorCode.INVALID,
          errorMessage: 'INVALID_TOKEN'
        }
      }
      return {
        isValid: false,
        isExpired: false,
        errorCode: TokenErrorCode.INVALID,
        errorMessage: 'INVALID_TOKEN'
      }
    }
  }

  /**
   * Legacy method — preserves existing caller behaviour (401 for all failures).
   * Prefer verifyAccessTokenDetailed() for caller-side differentiation.
   */
  verifyAccessToken(token: string): Result<Account | null> {
    const result = this.verifyAccessTokenDetailed(token)
    if (result.isValid) {
      return Result.ok(result.payload ?? null)
    }
    return Result.fail(401, result.errorMessage ?? 'INVALID_ACCESS_TOKEN')
  }

  verifyRefreshToken(token: string): Result<Account | null> {
    try {
      const payload = jwt.verify(token, this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'))
      if (typeof payload === 'string') {
        return Result.fail(401, 'INVALID_REFRESH_TOKEN')
      }
      return Result.ok(payload as Account)
    } catch (error) {
      console.log(error)
      return Result.fail(401, 'INVALID_REFRESH_TOKEN')
    }
  }

  decodeToken<T>(token: string): object | string | null {
    return jwt.decode(token)
  }
}
