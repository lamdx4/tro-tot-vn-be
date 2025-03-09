import jwt from 'jsonwebtoken';
import { ConfigService } from './config.service';

export default class JWTService {
  private configService: ConfigService;

  constructor() {
    this.configService = ConfigService.gI();
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'), {
      expiresIn: parseInt(this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRES_IN'), 10),
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'), {
      expiresIn: parseInt(this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES_IN'), 10),
    });
  }

  verifyAccessToken(token: string): object | string {
    try {
      return jwt.verify(token, this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'));
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): object | string {
    try {
      return jwt.verify(token, this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'));
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  decodeToken(token: string): object | string | null {
    return jwt.decode(token);
  }
}
