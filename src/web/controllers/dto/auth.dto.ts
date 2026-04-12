export interface RegisterRequest {
  phone: string
  email: string
  firstName: string
  lastName: string
  birthday?: string
  gender?: string
  password?: string
  currentCity?: string
  currentDistrict?: string
  currentJob?: string
}

export interface OTPRequest {
  email: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
}

export interface LoginRequest {
  identifier: string
  password?: string
}

export interface LogoutRequest {
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ResetPasswordRequest {
  password?: string
  resetToken: string
}

export interface ChangePasswordRequest {
  oldPassword?: string
  newPassword?: string
}

export interface LoginResponse {
  token: {
    accessToken: string
    refreshToken: string
  }
  account: any
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface OTPResponse {
  message: string
}
