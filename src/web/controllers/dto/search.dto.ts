export interface SearchResponse<T = any> {
  searchLogId?: number
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  searchTimeMs: number
}

export interface SearchFeedbackRequest {
  searchLogId: number
  isHelpful: boolean
  issues?: string[]
  comment?: string
}

export interface SearchClickRequest {
  searchLogId: number
  searchLogItemId: number
}

export interface SearchHealthResponse {
  status: 'healthy' | 'unhealthy' | 'error'
  searchService: 'connected' | 'disconnected'
}
