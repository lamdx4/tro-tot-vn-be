import { pythonSearchService, PythonSearchParams } from './python-search.service'
import redisClient from '../infras/redis/redis'
import { PostRepository } from '../infras/repositories/post.repository'
import { Post } from '../domains/entities/post.entity'

export interface SearchParams {
  query: string
  city?: string
  district?: string
  ward?: string
  priceMin?: number
  priceMax?: number
  acreageMin?: number
  acreageMax?: number
  interiorCondition?: string
  page?: number
  pageSize?: number
}

export interface SearchResult {
  posts: Post[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  searchTimeMs: number
}

class SearchService {
  private postRepository: PostRepository
  private readonly CACHE_TTL = 300 // 5 minutes
  private readonly SEARCH_BUFFER = 100 // Fetch top 100 IDs from Python

  constructor() {
    this.postRepository = new PostRepository()
  }

  /**
   * Generate cache key from search parameters (excluding pagination)
   */
  private generateCacheKey(params: SearchParams): string {
    const searchParams = {
      query: params.query,
      city: params.city,
      district: params.district,
      ward: params.ward,
      priceMin: params.priceMin,
      priceMax: params.priceMax,
      acreageMin: params.acreageMin,
      acreageMax: params.acreageMax,
      interiorCondition: params.interiorCondition
    }
    return `search:${JSON.stringify(searchParams)}`
  }

  /**
   * Get post IDs from cache or Python service
   */
  private async getPostIds(params: SearchParams): Promise<number[]> {
    const cacheKey = this.generateCacheKey(params)
    
    // Try cache first
    try {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        console.log('[Search Service] Cache hit:', cacheKey)
        return JSON.parse(cached)
      }
    } catch (error) {
      console.error('[Search Service] Cache read error:', error)
    }

    // Cache miss - call Python service
    console.log('[Search Service] Cache miss, calling Python service')
    
    const pythonParams: PythonSearchParams = {
      query: params.query,
      city: params.city,
      district: params.district,
      ward: params.ward,
      price_min: params.priceMin,
      price_max: params.priceMax,
      acreage_min: params.acreageMin,
      acreage_max: params.acreageMax,
      interior_condition: params.interiorCondition,
      limit: this.SEARCH_BUFFER
    }

    const result = await pythonSearchService.search(pythonParams)
    
    // Cache the IDs
    try {
      await redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result.post_ids))
      console.log('[Search Service] Cached results for', this.CACHE_TTL, 'seconds')
    } catch (error) {
      console.error('[Search Service] Cache write error:', error)
    }

    return result.post_ids
  }

  /**
   * Search posts with pagination
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const startTime = Date.now()
    
    // Default pagination
    const page = params.page || 1
    const pageSize = params.pageSize || 20

    // 1. Get post IDs (from cache or Python)
    const postIds = await this.getPostIds(params)
    
    console.log(`[Search Service] Got ${postIds.length} post IDs from Python:`, postIds.slice(0, 5))

    if (postIds.length === 0) {
      return {
        posts: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0
        },
        searchTimeMs: Date.now() - startTime
      }
    }

    // 2. Query SQL for full posts
    const allPosts = await this.postRepository
      .createQueryBuilder('post')
      .whereInIds(postIds)
      .leftJoinAndSelect('post.owner', 'owner')
      .leftJoinAndSelect('post.multimediaFiles', 'postMultimediaFiles')
      .leftJoinAndSelect('postMultimediaFiles.file', 'file')
      .getMany()
    
    console.log(`[Search Service] SQL returned ${allPosts.length} posts`)

    // 3. Preserve Milvus ranking order
    const orderedPosts = postIds
      .map(id => allPosts.find(p => p.postId === id))
      .filter((p): p is Post => p !== undefined)

    // 4. Paginate in memory
    const start = (page - 1) * pageSize
    const paginatedPosts = orderedPosts.slice(start, start + pageSize)

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        pageSize,
        total: orderedPosts.length,
        totalPages: Math.ceil(orderedPosts.length / pageSize)
      },
      searchTimeMs: Date.now() - startTime
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return pythonSearchService.healthCheck()
  }
}

export const searchService = new SearchService()

