import axios, { AxiosInstance } from 'axios'
import { ConfigService } from './config.service'

export interface UserInteraction {
  postId: number
  typeAction: 1 | 2 | 3  // 1=view, 2=save, 3=contact
  timestamp: string       // ISO 8601 format
}

export interface UserProfile {
  city?: string
  district?: string
  birthday?: string
  gender?: string
  currentJob?: string
}

export interface PythonRecommendParams {
  vecHistory: UserInteraction[]
  userProfile?: UserProfile
  limit?: number
}

export interface RecommendCandidate {
  postId: number
  score: number
  reason: string
}

export interface PythonRecommendResponse {
  success: boolean
  candidates: RecommendCandidate[]
  total: number
  processing_time_ms: number
}

class PythonRecommendService {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    const config = ConfigService.gI()
    this.baseURL = config.getOrThrow('RECOMMEND_SERVICE_URL')
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 second timeout (embedding can take time)
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Call Python recommend-service for personalized recommendations
   */
  async recommend(params: PythonRecommendParams): Promise<PythonRecommendResponse> {
    console.log(`\n[Python Recommend Service] ========== CALLING PYTHON API ==========`)
    console.log('[Python Recommend Service] 🔗 URL:', `${this.baseURL}/recommend/candidates`)
    console.log('[Python Recommend Service] 📦 Request payload:', {
      historySize: params.vecHistory.length,
      userProfile: params.userProfile,
      limit: params.limit,
      sampleHistory: params.vecHistory.slice(0, 3)
    })
    
    try {
      const requestStartTime = Date.now()
      const response = await this.client.post<PythonRecommendResponse>(
        '/recommend/candidates',
        params
      )
      
      const requestTime = Date.now() - requestStartTime
      console.log(`[Python Recommend Service] ✅ HTTP ${response.status} - Got ${response.data.total} candidates`)
      console.log(`[Python Recommend Service]   - Request time: ${requestTime}ms`)
      console.log(`[Python Recommend Service]   - Python processing time: ${response.data.processing_time_ms}ms`)
      console.log(`[Python Recommend Service] ========== PYTHON API SUCCESS ==========\n`)
      
      return response.data
    } catch (error) {
      console.error(`[Python Recommend Service] ❌ ========== PYTHON API FAILED ==========`)
      
      if (axios.isAxiosError(error)) {
        console.error('[Python Recommend Service] 🔴 Axios Error:', error.message)
        console.error('[Python Recommend Service]   - Code:', error.code)
        console.error('[Python Recommend Service]   - URL:', error.config?.url)
        console.error('[Python Recommend Service]   - Method:', error.config?.method)
        
        if (error.response) {
          console.error('[Python Recommend Service]   - HTTP Status:', error.response.status)
          console.error('[Python Recommend Service]   - Response data:', error.response.data)
          console.error(`[Python Recommend Service] ========== END ERROR ==========\n`)
          throw new Error(`Recommend service error: ${error.response.data.detail || error.message}`)
        } else if (error.request) {
          console.error('[Python Recommend Service]   - No response received (timeout/connection issue)')
          console.error('[Python Recommend Service]   - Request timeout:', this.client.defaults.timeout, 'ms')
        }
        
        console.error(`[Python Recommend Service] ========== END ERROR ==========\n`)
        throw new Error(`Recommend service unavailable: ${error.message}`)
      }
      
      console.error('[Python Recommend Service] 🔴 Unknown error:', error)
      console.error(`[Python Recommend Service] ========== END ERROR ==========\n`)
      throw error
    }
  }

  /**
   * Health check for Python recommend service
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

export const pythonRecommendService = new PythonRecommendService()

