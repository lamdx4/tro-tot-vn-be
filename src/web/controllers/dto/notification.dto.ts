/**
 * REQUEST DTOs
 */

export interface RegisterTokenRequest {
  /**
   * FCM Device Token
   * @example "fcm_token_123456"
   */
  fcmToken: string;
  
  /**
   * Device platform (ios, android, web)
   * @example "android"
   */
  platform?: string;
}

export interface UnregisterTokenRequest {
  /**
   * FCM Device Token to unregister
   * @example "fcm_token_123456"
   */
  fcmToken: string;
}

/**
 * RESPONSE DTOs
 */

export interface DeviceTokenResponse {
  id: number;
  customerId: number | null;
  fcmToken: string;
  platform: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Union type for all possible Notification error messages
 */
export type NotificationErrorMessage = 
  | 'FCM_TOKEN_REQUIRED'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | '';

/**
 * Specialized response for Notification errors to show possible messages in Swagger
 */
export interface NotificationErrorResponse {
  status: number;
  message: NotificationErrorMessage;
  error: any[];
  data: null;
}
