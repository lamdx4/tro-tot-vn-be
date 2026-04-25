/**
 * REQUEST DTOs
 */

export interface RegisterRequest {
  /**
   * Phone number (Vietnam format)
   * @pattern ^(0|84)(3|5|7|8|9)([0-9]{8})$
   * @example "0912345678"
   */
  phone: string;

  /**
   * Email address
   * @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
   * @example "user@example.com"
   */
  email: string;

  /**
   * User first name
   * @minLength 1
   * @maxLength 30
   */
  firstName: string;

  /**
   * User last name
   * @minLength 1
   * @maxLength 30
   */
  lastName: string;

  /**
   * Date of birth (ISO8601 string)
   * @example "1990-01-01"
   */
  birthday?: string;

  /**
   * Gender
   * @pattern ^(Male|Female)$
   * @example "Male"
   */
  gender?: string;

  /**
   * Password
   * @minLength 8
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
   */
  password?: string;

  /** @maxLength 100 */
  currentCity?: string;

  /** @maxLength 100 */
  currentDistrict?: string;

  /** @maxLength 30 */
  currentJob?: string;
}

export interface OTPRequest {
  /** @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ */
  email: string;
}

export interface VerifyOTPRequest {
  /** @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ */
  email: string;
  /** @minLength 6 @maxLength 6 */
  otp: string;
}

export interface LoginRequest {
  /** Phone or Email */
  identifier: string;
  password?: string;
}

export interface LogoutRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  /**
   * New password
   * @minLength 8
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
   */
  password?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  /**
   * New password
   * @minLength 8
   * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
   */
  newPassword?: string;
}

/**
 * RESPONSE DTOs
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OTPResponse {
  message: string;
  ttl?: number;
}

/**
 * Union type for all possible Auth error messages
 */
export type AuthErrorMessage = 
  | 'USER_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_FOUND'
  | 'EMAIL_EXIST'
  | 'OTP_SENT_RECENTLY'
  | 'OTP_INVALID'
  | 'TOKEN_REQUIRED'
  | 'INVALID_TOKEN'
  | 'INVALID_ACCESS_TOKEN'
  | 'INVALID_REFRESH_TOKEN'
  | 'ACCOUNT_INACTIVE'
  | 'ACCOUNT_NOT_FOUND'
  | 'PASSWORD_NOT_MATCH'
  | 'UPDATE_PASSWORD_FAIL'
  | 'ROLLBACK_FAILED'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Specialized response for Auth errors to show possible messages in Swagger
 */
export interface AuthErrorResponse {
  status: number;
  /**
   * Auth error code. Possible values:
   * - USER_ALREADY_EXISTS: User with this phone/email already exists
   * - USER_NOT_FOUND: User not found
   * - EMAIL_NOT_FOUND: Email not found during OTP request
   * - INVALID_OTP: OTP is incorrect or expired
   * - PASSWORD_NOT_MATCH: Incorrect password
   * - ACCOUNT_INACTIVE: Account is currently blocked or inactive
   * - INVALID_TOKEN: Token is invalid or expired
   * - TOKEN_REQUIRED: Token is missing
   * - EMAIL_EXIST: OTP requested too frequently for this email
   * - INTERNAL_SERVER_ERROR: unexpected server error
   */
  message: AuthErrorMessage;
  error: any[];
  data: null;
}
