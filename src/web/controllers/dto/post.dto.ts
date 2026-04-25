export interface HidePostRequest {
  postId: number
}

export interface PostSearchQuery {
  keyword?: string
  city?: string
  district?: string
  ward?: string
  acreage?: string // format: min-max
  price?: string // format: min-max
  interiorCondition?: string
  limit?: number
  cursor?: string
}

export interface PostResponse {
  postId: number
  ownerId: number
  status: string
  createdAt: Date
  title: string
  description: string
  price: number
  streetNumber: string
  street: string
  ward: string
  district: string
  city: string
  interiorCondition: string
  acreage: number
  multimediaFiles?: any[]
}

export interface CursorPagingResponse<T, V = any> {
  dataPag: T[]
  nextCursor: V | null
  hasMore: boolean
}

/**
 * Union type for all possible Post error messages
 */
export type PostErrorMessage = 
  | 'POST_NOT_FOUND'
  | 'CUSTOMER_NOT_OWNER'
  | 'STATE_NOT_ALLOW'
  | 'CONTENT_VIOLATION'
  | 'DELETED_FAILURE'
  | 'UPLOAD_FAILED'
  | 'UPLOAD_SUCCESS'
  | 'FETCH_POSTS_FAILED'
  | 'IMAGE_SIZE_LIMIT_EXCEEDED'
  | 'VIDEO_SIZE_LIMIT_EXCEEDED'
  | 'FILE_SIZE_LIMIT_EXCEEDED'
  | 'FILE_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Specialized response for Post errors to show possible messages in Swagger
 */
export interface PostErrorResponse {
  status: number;
  /**
   * Post error message/code. Possible values:
   * - POST_NOT_FOUND: Post does not exist
   * - CUSTOMER_NOT_OWNER: User is not the owner of this post
   * - STATE_NOT_ALLOW: Post is not in a state that allows this action
   * - CONTENT_VIOLATION: AI detected inappropriate content
   * - DELETED_FAILURE: Failed to delete associated files
   * - UPLOAD_FAILED: Generic upload failure
   * - FETCH_POSTS_FAILED: Generic fetch failure
   * - IMAGE_SIZE_LIMIT_EXCEEDED: Image >= 5MB
   * - VIDEO_SIZE_LIMIT_EXCEEDED: Video >= 25MB
   * - FILE_SIZE_LIMIT_EXCEEDED: Other file >= 25MB
   * - FILE_NOT_FOUND: No file provided
   * - INTERNAL_SERVER_ERROR: unexpected server error
   */
  message: PostErrorMessage;
  error: any[];
  data: null;
}
