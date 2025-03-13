import ResponseData from '@/utils/response'
import { Request, Response, NextFunction } from 'express'
import AuthService from '@/services/auth.service'
import { generateRandomNumber } from '@/utils/config/generate.helper'

class AuthController {
    private authService = new AuthService()
  
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Your code here
        const email = req.body.email
        const isEmail = await this.authService.isEmail(email)
        if (!isEmail) {
            res.status(400).json(ResponseData.error(400, 'EMAIL_NOT_FOUND', 'Email not found'))
            return
        }
        const otp = generateRandomNumber(6);
        res.status(200).json(ResponseData.success(email))
    } catch (e) {
      next(e)
    }
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
