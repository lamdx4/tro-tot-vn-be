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
        return ResponseData.success('Account created successfully')
      } else {
        this.setStatus(result.code)
        return ResponseData.error(result.code, result.error ?? '', '') as any
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
  public async sendOTPRegister(
    @Body() body: OTPRequest
  ): Promise<ResponseData<OTPResponse>> {
    const result = await this.authService.sendOtp('otp-register', body.email)
    if (result.isSuccess) {
      return new ResponseData(200, result.getValue()?.message || '', [], result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Verify OTP for registration
   */
  @Post("verify-otp-register")
  public async verifyOTPRegister(
    @Body() body: VerifyOTPRequest
  ): Promise<ResponseData<any>> {
    const result = await this.authService.verifyOtp('otp-register', body.email, body.otp)
    if (result.isSuccess) {
      await this.authService.setVerifiedCustomer(body.email)
      return ResponseData.success('OTP verified successfully')
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Request password reset OTP
   */
  @Post("forgot-password")
  public async forgotPassword(
    @Body() body: OTPRequest
  ): Promise<ResponseData<OTPResponse | any>> {
    const result = await this.authService.sendOtp('otp-forgot-password', body.email)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Verify password reset OTP
   */
  @Post("verify-otp")
  public async verifyOtp(
    @Body() body: VerifyOTPRequest
  ): Promise<ResponseData<any>> {
    const result = await this.authService.verifyOtpForgotPassword(
      'otp-forgot-password',
      body.email,
      body.otp
    )
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Reset password with reset token
   */
  @Post("reset-password")
  public async resetPassword(
    @Body() body: ResetPasswordRequest
  ): Promise<ResponseData<any>> {
    const { resetToken, password } = body
    const result = await this.authService.resetPassword(resetToken, password || '')
    if (result.isSuccess) {
      return ResponseData.success('Password reset successfully')
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Login to account
   */
  @Post("login")
  public async login(
    @Body() body: LoginRequest
  ): Promise<ResponseData<LoginResponse | any>> {
    const result = await this.authService.login(body.identifier, body.password || '')
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Refresh access token
   */
  @Post("refresh-token")
  public async refreshToken(
    @Body() body: RefreshTokenRequest
  ): Promise<ResponseData<RefreshTokenResponse | any>> {
    const result = await this.authService.refreshToken(body.refreshToken)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Logout from account
   */
  @Post("logout")
  @Security("jwt")
  public async logout(
    @Body() body: LogoutRequest
  ): Promise<ResponseData<string | any>> {
    const result = await this.authService.logout(body.token)
    if (result.isSuccess) {
      return ResponseData.success('Logout successful')
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Change account password
   */
  @Post("change-password")
  @Security("jwt")
  public async changePassword(
    @Body() body: ChangePasswordRequest,
    @Request() req: any
  ): Promise<ResponseData<string | any>> {
    try {
      const { oldPassword, newPassword } = body
      const accountId = req.user?.accountId

      const result = await this.authService.changePassword(
        accountId,
        oldPassword || '',
        newPassword || ''
      )

      if (result.isSuccess) {
        return ResponseData.success('Password changed successfully')
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
