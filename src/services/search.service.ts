import { pythonSearchService, PythonSearchParams } from './python-search.service'
import { redisClient } from '../infras/redis/redis'
import { PostRepository } from '../infras/repositories/post.repository'
import { SearchLogRepository } from '../infras/repositories/search-log.repository'
import { SearchLogItemRepository } from '../infras/repositories/search-log-item.repository'
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
  searchLogId?: number  // NEW: for feedback/click tracking
  posts: Array<Post & { searchLogItemId?: number }>  // NEW: attach itemId
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
  private searchLogRepository: SearchLogRepository
  private searchLogItemRepository: SearchLogItemRepository
  private readonly CACHE_TTL = 300 // 5 minutes
  private readonly SEARCH_BUFFER = 100 // Fetch top 100 IDs from Python

  constructor() {
    this.postRepository = new PostRepository()
    this.searchLogRepository = new SearchLogRepository()
    this.searchLogItemRepository = new SearchLogItemRepository()
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

    console.log('[Search Service] Calling Python with params:', JSON.stringify(pythonParams, null, 2))

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

    console.log('[Search Service] Received params:', JSON.stringify(params, null, 2))

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

    const result: SearchResult = {
      posts: paginatedPosts,
      pagination: {
        page,
        pageSize,
        total: orderedPosts.length,
        totalPages: Math.ceil(orderedPosts.length / pageSize)
      },
      searchTimeMs: Date.now() - startTime
    }

    // IMPORTANT: Await logging to attach IDs before returning response
    await this.logSearchAsync(params, result)

    return result
  }

  /**
   * Log search event and results (async, non-blocking)
   */
  private async logSearchAsync(params: SearchParams, result: SearchResult): Promise<void> {
    try {
      console.log('[Search Service] Starting async logging...')

      // 1. Log search event (customerId = null for all users, including guests)
      const searchLog = await this.searchLogRepository.logSearch({
        customerId: null,  // Log all searches (guests + logged-in)
        query: params.query,
        city: params.city,
        district: params.district,
        minPrice: params.priceMin,
        maxPrice: params.priceMax,
        minAcreage: params.acreageMin,
        maxAcreage: params.acreageMax,
        interiorCondition: params.interiorCondition,
        resultCount: result.pagination.total,
        searchTimeMs: result.searchTimeMs
      })

      console.log(`[Search Service] Created SearchLog: ${searchLog.logId}`)

      // 2. Log search items (only current page results)
      const itemsData = result.posts.map((post, index) => ({
        searchLogId: searchLog.logId,
        postId: post.postId,
        position: ((params.page || 1) - 1) * (params.pageSize || 20) + index + 1,  // Fixed calculation
        relevanceScore: null,  // TODO: Get from Python service
        capturedTitle: post.title,
        capturedDescription: post.description,
        capturedPrice: post.price,
        capturedAcreage: post.acreage,
        capturedCity: post.city,
        capturedDistrict: post.district
      }))

      console.log(`[Search Service] Preparing to log ${itemsData.length} items`)

      const savedItems = await this.searchLogItemRepository.logSearchItems(itemsData)

      console.log(`[Search Service] Saved ${savedItems.length} SearchLogItems`)

      // 3. Attach IDs to response for frontend tracking
      result.searchLogId = searchLog.logId
      result.posts.forEach((post, index) => {
        post.searchLogItemId = savedItems[index].itemId
        console.log(`[Search Service] Attached itemId ${savedItems[index].itemId} to post ${post.postId}`)
      })

      console.log(`[Search Service] ✅ Successfully logged search ${searchLog.logId} with ${savedItems.length} items`)
    } catch (error) {
      console.error('[Search Service] ❌ Failed to log search:', error)
      // Don't throw - logging failure shouldn't break search
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