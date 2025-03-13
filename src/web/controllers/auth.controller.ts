import ResponseData from '@/utils/response'
import { Request, Response, NextFunction } from 'express'
import AuthService from '@/services/auth.service'
import { generateRandomNumber } from '@/utils/config/generate.helper'
import redis from '@/infras/redis/redis'
import { MailService } from '@/services'

class AuthController {
    private authService = new AuthService()
    private mailService = new MailService()
  
  /**
   * Get all examples
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Your code here
        const email = req.body.email
        const isEmail = await this.authService.isEmail(email)
        if (!isEmail) {
            res.status(400).json(ResponseData.error(400, 'EMAIL_NOT_FOUND', 'Email not found'))
            return
        }
        

        // Tạo OTP (6 chữ số)
        const otp = generateRandomNumber(6)

        // Lưu OTP vào Redis (hết hạn sau 5 phút)
        await redis.set(`otp:${email}`, otp.toString(), "EX", 300); 

        const storedOtp = await redis.get(`otp:${email}`);

        // Gửi OTP qua email
        await this.mailService.createTransporter()
        // Gửi OTP qua email
        await this.mailService.sendMail({
            from: "djiahak@gmail.com",
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${storedOtp}`,
        });

        res.status(200).json(ResponseData.success('OTP sent to email'))
    } catch (e) {
      next(e)
    }
  }
  //verify-otp
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Your code here
        const email = req.body.email
        const otp = req.body.otp
        const storedOtp = await redis.get(`otp:${email}`);
        const isEmail = await this.authService.isEmail(email)
        if (isEmail) {
          if (otp !== storedOtp) {
            res.status(400).json(ResponseData.error(400, 'OTP_INVALID', 'Invalid OTP'))
            return;
          }
        }else{
          res.status(400).json(ResponseData.error(400, 'EMAIL_NOT_FOUND', 'Email not found'))
          return;
        }
        res.status(200).json(ResponseData.success('OTP verified'))
    } catch (e) {
      next(e)
    }
  }
  //reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Your code here
        const password = req.body.password
        const email = req.body.email
        
        const isEmail = await this.authService.isEmail(email)

        if (isEmail) {
          if (password === isEmail.password) {
            res.status(400).json(ResponseData.error(400, 'PASSWORD_NOT_MATCH', 'Vui lòng nhập mật khẩu khác với mật khẩu cũ'))
            return
          }
        }
        // Update password
        await this.authService.updatePassword(email, password)

        res.status(200).json(ResponseData.success('Password reset successfully'))
    } catch (e) {
      next(e)
    }
  }
}

// Create and export controller instance
export default new AuthController()
