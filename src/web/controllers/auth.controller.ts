import AuthService from '@/services/auth.service'
import ResponseData from '@/utils/response'
import { NextFunction, Request, Response } from 'express'
class AuthController {
  private authService: AuthService
  constructor() {
    this.authService = new AuthService()
  }
  async login(req: Request, res: Response, next : NextFunction) {
    const { identifier, password } = req.body
    try {
      const result = await this.authService.login(identifier, password)
      res.status(200).json(ResponseData.success(result))
    } catch (error) {
      next(error)
    }
  }
}
export default new AuthController()
