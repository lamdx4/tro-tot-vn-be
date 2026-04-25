export interface RecommendationResponse<T = any> {
  recommendationLogId?: number
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  processingTimeMs: number
}

export interface RecommendationClickRequest {
  recommendationLogId: number
  recommendationLogItemId: number
}

export interface RecommendHealthResponse {
  status: 'healthy' | 'unhealthy' | 'error'
  recommendService: 'connected' | 'disconnected'
}

/**
 * Union type for all possible Recommendation error messages
 */
export type RecommendErrorMessage = 
  | 'Page must be >= 1'
  | 'PageSize must be between 1 and 50'
  | 'No recommendation history yet. Browse some posts first!'
  | 'Recommendation service is temporarily unavailable'
  | 'recommendationLogId and recommendationLogItemId are required'
  | 'Failed to get recommendations'
  | 'Failed to log click'
  | '';

/**
 * Error response structure for Recommendation API (Legacy format)
 */
export interface RecommendErrorResponse {
  success: boolean;
  message: RecommendErrorMessage;
}
