import ResponseData from '@/utils/response'
import { Request, Response, NextFunction } from 'express'
import AuthService from '@/services/auth.service'
import { generateRandomNumber } from '@/utils/config/generate.helper'

class AuthController {
    private authService = new AuthService()

  async registerAccount(req: Request, res: Response, next: NextFunction){
    const {phone, email, firstName, lastName, birthday, gender, password} = req.body
    const newUser = await this.authService.registerAccount(phone, email, firstName, lastName, birthday, gender, password)
    if(newUser.isSuccess){
      res.status(201).json(ResponseData.success("User registered successfully"))
    }
    else{
      if(newUser.code == 409){
        res.status(409).json(ResponseData.error(409, "USER_ALREADY_EXISTS", "User already exists"))
      } else {
        res.status(402).json(ResponseData.error(402, "ROLL_BACK_TRANSACTION", "Roll Back Transaction"))
      }
    }
  }
  
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
