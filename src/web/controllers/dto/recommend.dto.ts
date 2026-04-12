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
