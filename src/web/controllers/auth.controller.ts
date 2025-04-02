import { email } from 'envalid'
import ResponseData from '@/utils/data-types/response'
import { Request, Response, NextFunction } from 'express'
import AuthService from '@/services/auth.service'

class AuthController {
  private authService = new AuthService()

  async registerAccount(req: Request, res: Response, next: NextFunction) {
    const { phone, email, firstName, lastName, birthday, gender, password } = req.body
    const newUser = await this.authService.registerAccount(
      phone,
      email,
      firstName,
      lastName,
      birthday,
      gender,
      password
    )
    if (newUser.isSuccess) {
      res.status(201).json(ResponseData.success('User registered successfully'))
    } else {
      if (newUser.code == 409) {
        res.status(409).json(ResponseData.error(409, 'USER_ALREADY_EXISTS', 'User already exists'))
      } else {
        res.status(402).json(ResponseData.error(402, 'ROLL_BACK_TRANSACTION', 'Roll Back Transaction'))
      }
    }
  }

  async sendOTPRegister(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body
    const sendOTP = await this.authService.sendOtp('otp-register', email)
    if (sendOTP.isSuccess) {
      res.status(200).json(ResponseData.success(sendOTP.getValue()))
      console.log(sendOTP.getValue())
    } else if (sendOTP.code === 404) {
      res.status(404).json(ResponseData.error(404, 'USER_NOT_FOUND', 'User with this email does not exist'))
    } else if (sendOTP.code === 429) {
      res.status(429).json(ResponseData.error(429, 'EMAIL_EXIST', sendOTP.error ?? 'Unknown error')) // Trả về số giây còn lại
    } else {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while sending OTP'))
    }
  }

  async verifyOTPRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body
      const result = await this.authService.verifyOtp('otp-register', email, otp)

      if (result.isSuccess) {
        const r = await this.authService.setVerifiedCustomer(email)
        if (r.isSuccess) {
          res.status(200).json(ResponseData.success(r.getValue()))
        } else {
          res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while verifying OTP'))
        }
        return
      } else if (result.code === 400) {
        res.status(400).json(ResponseData.error(400, 'INVALID_OTP', 'OTP is incorrect or expired'))
        return
      }
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while verifying OTP'))
    } catch (error) {
      console.error('Error in verifyOtp:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const result = await this.authService.sendOtp('otp-forgot-password', email)

      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'USER_NOT_FOUND', 'User with this email does not exist'))
      } else if (result.code === 429) {
        res.status(429).json(ResponseData.error(429, 'EMAIL_EXIST', result.error ?? 'Unknown error')) // Trả về số giây còn lại
      } else {
        res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while sending OTP'))
      }
    } catch (error) {
      console.error('Error in forgotPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body
      const result = await this.authService.verifyOtpForgotPassword('otp-forgot-password', email, otp)

      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
        return
      } else if (result.code === 400) {
        res.status(400).json(ResponseData.error(400, 'INVALID_OTP', 'OTP is incorrect or expired'))
        return
      }

      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while verifying OTP'))
    } catch (error) {
      console.error('Error in verifyOtp:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, resetToken } = req.body

      if (!resetToken) {
        res.status(400).json(ResponseData.error(400, 'TOKEN_REQUIRED', 'Reset token is required'))
        return
      }

      const result = await this.authService.resetPassword(resetToken, password)

      if (result.isSuccess) {
        res.status(200).json(ResponseData.success('Password reset successfully'))
        return
      } else if (result.code === 401) {
        res.status(401).json(ResponseData.error(401, 'INVALID_TOKEN', 'Reset token is invalid or expired'))
        return
      }

      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while resetting password'))
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const { identifier, password } = req.body
    try {
      const result = await this.authService.login(identifier, password)
      res.status(200).json(ResponseData.success(result))
    } catch (error) {
      next(error)
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    const { token } = req.body
    try {
      const result = await this.authService.logout(token)
      if (result.isSuccess) {
        res.status(result.code).json(ResponseData.successWithCode(result.code, result.getValue()))
        return
      }
      res.status(result.code).json(ResponseData.error(result.code, 'INVALID_ACCESS_TOKEN', 'Invalid access token'))
    } catch (error) {
      next(error)
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body
    try {
      const result = await this.authService.refreshToken(refreshToken)
      if (result.isSuccess) {
        res.status(result.code).json(ResponseData.successWithCode(result.code, result.getValue()))
        return
      }
      res.status(result.code).json(ResponseData.error(result.code, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token'))
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
