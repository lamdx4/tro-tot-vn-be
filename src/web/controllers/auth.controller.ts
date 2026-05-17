import {
  Body,
  Post,
  Put,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
  Controller,
  Response,
} from '@tsoa/runtime'
import ResponseData from '@/utils/data-types/response'
import AuthService from '@/services/auth.service'
import {
  RegisterRequest,
  OTPRequest,
  VerifyOTPRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  LoginResponse,
  RefreshTokenResponse,
  OTPResponse,
  AuthErrorResponse,
  AuthErrorMessage
} from '@/web/controllers/dto/auth.dto'

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private authService = new AuthService()

  constructor() {
    super()
  }

  /**
   * Register a new account
   */
  @Post("register")
  @SuccessResponse("201", "User registered successfully")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(401, "Unauthorized")
  @Response<AuthErrorResponse>(409, "Conflict")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async registerAccount(
    @Body() body: RegisterRequest,
    @Request() req: any
  ): Promise<ResponseData<string | null>> {
    try {
      const {
        phone,
        email,
        firstName,
        lastName,
        birthday,
        gender,
        password,
        currentCity,
        currentDistrict,
        currentJob,
      } = body

      // Legacy validation: Birthday must be in the past
      if (birthday) {
        const date = new Date(birthday)
        if (date >= new Date()) {
          this.setStatus(400)
          return ResponseData.error(400, 'VALIDATION_ERROR', 'Ngày sinh phải là ngày trong quá khứ') as any
        }
      }

      const result = await this.authService.registerAccount(
        phone,
        email,
        firstName,
        lastName,
        new Date(birthday || ''),
        gender || '',
        password || '',
        currentCity,
        currentDistrict,
        currentJob
      )

      if (result.isSuccess) {
        this.setStatus(201) // Matches res.status(201) in backup
        return ResponseData.success('User registered successfully') // Matches ResponseData.success (200 in status field)
      } else {
        if (result.code === 409) {
          this.setStatus(409)
          return ResponseData.error(409, 'USER_ALREADY_EXISTS', 'User already exists') as any
        } else {
          this.setStatus(402)
          return ResponseData.error(402, 'ROLL_BACK_TRANSACTION', 'Roll Back Transaction') as any
        }
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Send OTP for registration
   */
  @Post("send-otp-register")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(404, "Not Found")
  @Response<AuthErrorResponse>(429, "Email Exists / Rate Limit")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async sendOTPRegister(
    @Body() body: OTPRequest
  ): Promise<ResponseData<OTPResponse>> {
    const result = await this.authService.sendOtp('otp-register', body.email)
    if (result.isSuccess) {
      this.setStatus(200)
      const data = result.getValue()
      if (!data) {
        return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Unexpected null response') as any
      }
      return ResponseData.success({
        message: data.message,
        ttl: data.remainingTime
      })
    } else if (result.code === 404) {
      this.setStatus(404)
      return ResponseData.error(404, 'USER_NOT_FOUND', 'User with this email does not exist') as any
    } else if (result.code === 429) {
      this.setStatus(429)
      return ResponseData.error(429, 'EMAIL_EXIST', result.error ?? 'Unknown error') as any
    } else {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while sending OTP') as any
    }
  }

  /**
   * Verify OTP for registration
   */
  @Post("verify-otp-register")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async verifyOTPRegister(
    @Body() body: VerifyOTPRequest
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.authService.verifyOtp('otp-register', body.email, body.otp)
      if (result.isSuccess) {
        const r = await this.authService.setVerifiedCustomer(body.email)
        if (r.isSuccess) {
          this.setStatus(200)
          return ResponseData.success(r.getValue())
        } else {
          this.setStatus(500)
          return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while verifying OTP') as any
        }
      } else if (result.code === 400) {
        this.setStatus(400)
        return ResponseData.error(400, 'INVALID_OTP', 'OTP is incorrect or expired') as any
      }
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while verifying OTP') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Request password reset OTP
   */
  @Post("forgot-password")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(404, "Not Found")
  @Response<AuthErrorResponse>(429, "Email exists / Rate Limit")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async forgotPassword(
    @Body() body: OTPRequest
  ): Promise<ResponseData<OTPResponse | any>> {
    try {
      const result = await this.authService.sendOtp('otp-forgot-password', body.email)
      if (result.isSuccess) {
        this.setStatus(200)
        return ResponseData.success(result.getValue())
      } else if (result.code === 404) {
        this.setStatus(404)
        return ResponseData.error(404, 'USER_NOT_FOUND', 'User with this email does not exist') as any
      } else if (result.code === 429) {
        this.setStatus(429)
        return ResponseData.error(429, 'EMAIL_EXIST', result.error ?? 'Unknown error') as any
      } else {
        this.setStatus(500)
        return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while sending OTP') as any
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Verify password reset OTP
   */
  @Post("verify-otp")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async verifyOtp(
    @Body() body: VerifyOTPRequest
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.authService.verifyOtpForgotPassword(
        'otp-forgot-password',
        body.email,
        body.otp
      )
      if (result.isSuccess) {
        this.setStatus(200)
        return ResponseData.success(result.getValue())
      } else if (result.code === 400) {
        this.setStatus(400)
        return ResponseData.error(400, 'INVALID_OTP', 'OTP is incorrect or expired') as any
      }
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while verifying OTP') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Reset password with reset token
   */
  @Post("reset-password")
  @Response<AuthErrorResponse>(400, "Bad Request")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async resetPassword(
    @Body() body: ResetPasswordRequest
  ): Promise<ResponseData<any>> {
    try {
      const { resetToken, password } = body
      if (!resetToken) {
        this.setStatus(400)
        return ResponseData.error(400, 'TOKEN_REQUIRED', 'Reset token is required') as any
      }
      const result = await this.authService.resetPassword(resetToken, password || '')
      if (result.isSuccess) {
        this.setStatus(200)
        return ResponseData.success('Password reset successfully')
      } else if (result.code === 401) {
        this.setStatus(401)
        return ResponseData.error(401, 'INVALID_TOKEN', 'Reset token is invalid or expired') as any
      }
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'An error occurred while resetting password') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Login to account
   */
  @Post("login")
  @Response<AuthErrorResponse>(401, "Unauthorized")
  @Response<AuthErrorResponse>(423, "Account Inactive")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async login(
    @Body() body: LoginRequest
  ): Promise<ResponseData<LoginResponse | any>> {
    try {
      const result = await this.authService.login(body.identifier, body.password || '')
      this.setStatus(result.code)
      if (result.isSuccess) {
        return ResponseData.successWithCode(result.code, result.getValue())
      }
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Refresh access token
   * 
   * **Xác thực / Phân quyền - Mã lỗi tĩnh (401 Unauthorized):**
   * - `ACCESS_TOKEN_EXPIRED`: Access token hết hạn (trả về từ các endpoint yêu cầu xác thực -> gọi API refresh này).
   * - `INVALID_ACCESS_TOKEN`: Access token không hợp lệ/sai chữ ký (trả về từ các endpoint yêu cầu xác thực -> logout ngay).
   * - `REF_TOKEN_EXPIRED`: Refresh token hết hạn (trả về từ API refresh này -> logout ngay).
   * - `INVALID_REFRESH_TOKEN`: Refresh token không hợp lệ (trả về từ API refresh này -> logout ngay).
   */
  @Post("refresh-token")
  @Response<AuthErrorResponse>(401, "Unauthorized")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async refreshToken(
    @Body() body: RefreshTokenRequest
  ): Promise<ResponseData<RefreshTokenResponse | any>> {
    try {
      const result = await this.authService.refreshToken(body.refreshToken)
      this.setStatus(result.code)
      if (result.isSuccess) {
        return ResponseData.successWithCode(result.code, result.getValue())
      }
      return ResponseData.error(result.code, result.error || 'INVALID_REFRESH_TOKEN', result.error === 'REF_TOKEN_EXPIRED' ? 'Refresh token has expired' : 'Invalid refresh token') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Logout from account
   */
  @Post("logout")
  @Security("jwt")
  @Response<AuthErrorResponse>(401, "Unauthorized")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async logout(
    @Body() body: LogoutRequest
  ): Promise<ResponseData<string | any>> {
    try {
      const result = await this.authService.logout(body.token)
      this.setStatus(result.code)
      if (result.isSuccess) {
        return ResponseData.successWithCode(result.code, result.getValue())
      }
      return ResponseData.error(result.code, 'INVALID_ACCESS_TOKEN', 'Invalid access token') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', 'Something went wrong') as any
    }
  }

  /**
   * Change account password
   */
  @Post("change-password")
  @Security("jwt")
  @Response<AuthErrorResponse>(401, "Unauthorized")
  @Response<AuthErrorResponse>(500, "Internal Server Error")
  public async changePassword(
    @Body() body: ChangePasswordRequest,
    @Request() req: any
  ): Promise<ResponseData<string | any>> {
    try {
      const { oldPassword, newPassword } = body
      const accountId = Number(req.user?.accountId)

      // Legacy validation: New password must be different from old
      if (newPassword === oldPassword) {
        this.setStatus(400)
        return ResponseData.error(400, 'VALIDATION_ERROR', 'Mật khẩu mới phải khác mật khẩu cũ') as any
      }

      const result = await this.authService.changePassword(
        accountId,
        oldPassword || '',
        newPassword || ''
      )

      if (result.isSuccess) {
        this.setStatus(200)
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return ResponseData.error(result.code, result.error ?? '', '') as any
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
