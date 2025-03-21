import jwt, { JwtPayload } from 'jsonwebtoken'
import { ConfigService } from './config.service'
import { Result } from '@/utils/data-types/result'
import { Account } from '@/domains/entities/account.entity'

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

  verifyAccessToken(token: string): Result<Account | null> {
    try {
      const payload = jwt.verify(token, this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'))
      if (typeof payload === 'string') {
        return Result.fail(401, 'INVALID_ACCESS_TOKEN')
      }
      return Result.ok(payload as Account)
    } catch (error) {
      return Result.fail(401, 'INVALID_ACCESS_TOKEN')
    }
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
