import axios, { AxiosInstance } from 'axios'
import { ConfigService } from './config.service'

export interface PythonSearchParams {
  query: string
  city?: string
  district?: string
  ward?: string
  price_min?: number
  price_max?: number
  acreage_min?: number
  acreage_max?: number
  interior_condition?: string
  limit?: number
}

export interface PythonSearchResponse {
  success: boolean
  post_ids: number[]
  total: number
  search_time_ms: number
}

class PythonSearchService {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    const config = ConfigService.gI()
    this.baseURL = config.get('SEARCH_SERVICE_URL') || 'http://localhost:8000'
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000, // 5 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Call Python search-service for hybrid vector search
   */
  async search(params: PythonSearchParams): Promise<PythonSearchResponse> {
    try {
      const response = await this.client.post<PythonSearchResponse>('/search/hybrid', params)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Python Search Service] Request failed:', error.message)
        if (error.response) {
          console.error('Response data:', error.response.data)
          throw new Error(`Search service error: ${error.response.data.detail || error.message}`)
        }
        throw new Error(`Search service unavailable: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Health check for Python search service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.data.status === 'ok'
    } catch (error) {
      return false
    }
  }
}

export const pythonSearchService = new PythonSearchService()

