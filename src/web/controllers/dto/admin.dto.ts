export interface DashboardStatsResponse {
  totalPendingPost: number;
  totalRejectedPostInWeek: number;
  totalApprovedPostInWeek: number;
}

export interface ModeratePostRequest {
  /**
   * Action to perform on the post
   * @pattern ^(Approved|Rejected)$
   * @example "Approved"
   */
  actionType: "Approved" | "Rejected";
  
  /**
   * Reason for rejection (required if actionType is Rejected)
   * @minLength 1
   */
  reason?: string;
  
  /** Whether the content is considered hate speech */
  isHateContent?: boolean;
}

export interface ModeratorProfileResponse {
  adminId: number;
  firstName: string;
  lastName: string;
  birthday: Date;
  gender: string;
  joinedAt: Date;
  account: {
    email: string;
    phone: string;
    status: string;
  };
}

export interface ModeratorSummary {
  adminId: number;
  firstName: string;
  lastName: string;
  birthday: Date;
  gender: string;
  joinedAt: Date;
  account: {
    email: string;
    phone: string;
    status: string;
  };
}

export interface PostModerationHistoryResponse {
  postId: number;
  actionType: string;
  reason?: string;
  execAt: Date;
  admin: {
    accountId: number;
    firstName: string;
    lastName: string;
    account: {
      email: string;
    };
  };
}

export interface ModeratorActionHistoryResponse {
  postId: number;
  actionType: string;
  reason?: string;
  execAt: Date;
  post: {
    postId: number;
    title: string;
  };
}

export interface AddModeratorRequest {
  /** @minLength 1 @maxLength 30 */
  firstName: string;
  /** @minLength 1 @maxLength 30 */
  lastName: string;
  /** @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ */
  email: string;
  /** @pattern ^(0|84)(3|5|7|8|9)([0-9]{8})$ */
  phone: string;
  /** @pattern ^(Male|Female)$ */
  gender: string;
  /** @example "1990-01-01" */
  birthday: string;
}

export interface UpdateModeratorStatusRequest {
  /** 
   * New status for the moderator
   * @pattern ^(Active|Inactive|Blocked)$
   */
  status: string;
}

export interface ModerationStatsResponse {
  aiRejections: number;
  adminRejections: number;
  totalProcessed: number;
  [key: string]: any;
}

/**
 * Union type for all possible Admin error messages
 */
export type AdminErrorMessage = 
  | 'MODERATOR_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'REQUIRED_REASON'
  | 'PHONE_ALREADY_EXISTS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'MODERATION_FAILED'
  | 'UPDATE_PROFILE_FAILED'
  | 'UPDATE_PROFILE_SUCCESS'
  | 'ADD_MODERATOR_SUCCESS'
  | 'ACTION_TYPE_REQUIRED'
  | 'REJECTION_REASON_REQUIRED'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Specialized response for Admin errors to show possible messages in Swagger
 */
export interface AdminErrorResponse {
  status: number;
  /**
   * Admin error code. Possible values:
   * - MODERATOR_NOT_FOUND: Moderator ID does not exist
   * - USER_NOT_FOUND: General user not found
   * - ACCOUNT_NOT_FOUND: Linked account not found
   * - POST_NOT_FOUND: Target post for moderation not found
   * - REQUIRED_REASON: Reason is required when rejecting a post
   * - REJECTION_REASON_REQUIRED: Specific validation error for rejection
   * - PHONE_ALREADY_EXISTS: Phone number already in use
   * - EMAIL_ALREADY_EXISTS: Email already in use
   * - INTERNAL_SERVER_ERROR: unexpected server error
   */
  message: AdminErrorMessage;
  error: any[];
  data: null;
}
