export interface CustomerProfileResponse {
  customerId: number;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  gender?: string;
  birthday?: Date | string;
  currentCity?: string;
  currentDistrict?: string;
  currentJob?: string;
}

export interface UpdateProfileRequest {
  /** @minLength 2 @maxLength 50 */
  firstName?: string;
  /** @minLength 2 @maxLength 50 */
  lastName?: string;
  /** @pattern ^(Male|Female)$ */
  gender?: string;
  /** @example "1990-01-01" */
  birthday?: string;
  /** @maxLength 100 */
  currentCity?: string;
  /** @maxLength 100 */
  currentDistrict?: string;
  /** @pattern ^(Student|Employed)$ */
  currentJob?: string;
}

export interface RateRequest {
  /** @min 1 @max 5 */
  numStar: number;
  /** @maxLength 500 */
  comment?: string;
}

export interface RateResponse {
  rateId: number;
  customerId: number;
  postId: number;
  numStar: number;
  comment: string;
  createdAt: Date;
}

export interface SavePostRequest {
  /** @min 1 */
  postId: number;
}

export interface CreateSubscriptionRequest {
  /** @minLength 1 @maxLength 100 */
  city: string;
  /** @minLength 1 @maxLength 100 */
  district: string;
}

export interface SubscriptionResponse {
  subscriptionId: number;
  customerId: number;
  city: string;
  district: string;
  createdAt: Date;
}

/**
 * Union type for all possible Customer error messages
 */
export type CustomerErrorMessage = 
  | 'CUSTOMER_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'CANNOT_RATE_OWN_POST'
  | 'CONTENT_VIOLATION'
  | 'RATE_NOT_FOUND'
  | 'POST_NOT_SAVED'
  | 'POST_ALREADY_SAVED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'UPDATE_PROFILE_FAILED'
  | 'SUBSCRIPTION_ALREADY_EXISTS'
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | '';

/**
 * Specialized response for Customer errors to show possible messages in Swagger
 */
export interface CustomerErrorResponse {
  status: number;
  message: CustomerErrorMessage;
  error: any[];
  data: null;
}
