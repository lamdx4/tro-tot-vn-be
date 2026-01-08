import { pythonRecommendService, UserInteraction, UserProfile } from './python-recommend.service'
import { PostRepository } from '../infras/repositories/post.repository'
import { UserInteractionLogRepository } from '../infras/repositories/user-interaction-log.repository'
import { CustomerRepository } from '../infras/repositories/customer.repository'
import { RecommendationLogRepository } from '../infras/repositories/recommendation-log.repository'
import { RecommendationLogItemRepository } from '../infras/repositories/recommendation-log-item.repository'
import { RecommendationHistorySnapshotRepository } from '../infras/repositories/recommendation-history-snapshot.repository'
import { recommendationCache, CachedRecommendation } from './recommendation.cache'
import { Post } from '../domains/entities/post.entity'

export interface RecommendParams {
  customerId: number
  recommendationLogId?: number  // For cache lookup on page 2+
  page?: number
  pageSize?: number
}

export interface RecommendResult {
  posts: Post[]
  recommendationLogId?: number
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
  processingTimeMs: number
}

class RecommendService {
  private postRepository: PostRepository
  private interactionLogRepository: UserInteractionLogRepository
  private customerRepository: CustomerRepository
  private recommendationLogRepository: RecommendationLogRepository
  private recommendationLogItemRepository: RecommendationLogItemRepository
  private historySnapshotRepository: RecommendationHistorySnapshotRepository

  constructor() {
    this.postRepository = new PostRepository()
    this.interactionLogRepository = new UserInteractionLogRepository()
    this.customerRepository = new CustomerRepository()
    this.recommendationLogRepository = new RecommendationLogRepository()
    this.recommendationLogItemRepository = new RecommendationLogItemRepository()
    this.historySnapshotRepository = new RecommendationHistorySnapshotRepository()
  }

  /**
   * Collect user interaction history from database
   */
  private async collectUserHistory(customerId: number): Promise<UserInteraction[]> {
    console.log(`[Recommend Service] 📊 Querying UserInteractionLog for customer ${customerId}...`)

    // Get last 100 interactions (view/save/contact combined)
    // Following Alibaba DIN paper recommendation for optimal sequence length
    const logs = await this.interactionLogRepository.findRecentByCustomer(customerId, 100)

    const vecHistory: UserInteraction[] = logs.map(log => ({
      postId: log.postId,
      typeAction: log.typeAction,
      timestamp: log.createdAt.toISOString()
    }))

    console.log(`[Recommend Service] ✅ Collected ${vecHistory.length} interactions from UserInteractionLog`)

    if (vecHistory.length > 0) {
      const actionCounts = vecHistory.reduce((acc, v) => {
        acc[v.typeAction] = (acc[v.typeAction] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      console.log(`[Recommend Service]   - Breakdown: view=${actionCounts[1] || 0}, save=${actionCounts[2] || 0}, contact=${actionCounts[3] || 0}`)
    }

    return vecHistory
  }



  /**
   * Build user profile from customer data
   */
  private async buildUserProfile(customerId: number): Promise<UserProfile> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      select: ['currentCity', 'currentDistrict', 'birthday', 'currentJob']
    })

    if (!customer) {
      return {}
    }

    return {
      city: customer.currentCity || undefined,
      district: customer.currentDistrict || undefined,
      birthday: customer.birthday ? String(customer.birthday).split('T')[0] : undefined,
      currentJob: customer.currentJob || undefined
    }
  }

  /**
   * Get personalized recommendations for a customer with pagination
   */
  async getRecommendations(params: RecommendParams): Promise<RecommendResult> {
    const startTime = Date.now()
    const page = params.page || 1
    const pageSize = params.pageSize || 20

    console.log(`\n[Recommend Service] ========== START: Getting recommendations for customer ${params.customerId}, page=${page}, pageSize=${pageSize} ==========`)

    try {
      // 1. Check cache by logId (if provided)
      let cached: CachedRecommendation | null = null

      if (params.recommendationLogId) {
        cached = recommendationCache.get(params.recommendationLogId)
        if (cached) {
          console.log(`[Recommend Service] ✅ Cache HIT for logId ${params.recommendationLogId}`)
        } else {
          console.log(`[Recommend Service] ⚠️ Cache MISS for logId ${params.recommendationLogId} (expired or invalid)`)
        }
      } else {
        console.log(`[Recommend Service] ℹ️ No logId provided - creating new recommendation session`)
      }

      if (!cached) {
        // 2. Collect user interaction history
        console.log(`[Recommend Service] STEP 1: Collecting interaction history...`)
        const vecHistory = await this.collectUserHistory(params.customerId)

        // 3. Build user profile
        console.log(`[Recommend Service] STEP 2: Building user profile...`)
        const userProfile = await this.buildUserProfile(params.customerId)
        console.log(`[Recommend Service] ✅ User profile:`, userProfile)

        // 4. Call Python ML service
        console.log(`[Recommend Service] STEP 3: Calling Python service with ${vecHistory.length} interactions...`)
        const pythonStartTime = Date.now()

        const pythonResult = await pythonRecommendService.recommend({
          vecHistory,
          userProfile,
          limit: 100  // Fetch top 100 for caching
        })

        console.log(`[Recommend Service] ✅ Python service returned ${pythonResult.candidates.length} candidates in ${Date.now() - pythonStartTime}ms`)

        if (pythonResult.candidates.length === 0) {
          console.log('[Recommend Service] ⚠️ No candidates returned from Python service - returning empty')
          console.log(`[Recommend Service] ========== END (no candidates) - ${Date.now() - startTime}ms ==========\n`)
          return {
            posts: [],
            recommendationLogId: undefined,
            pagination: {
              page,
              pageSize,
              total: 0,
              hasMore: false
            },
            processingTimeMs: Date.now() - startTime
          }
        }

        // 5. Enrich with full post data from SQL
        console.log(`[Recommend Service] STEP 4: Enriching with SQL data...`)
        const postIds = pythonResult.candidates.map(c => c.postId)
        console.log(`[Recommend Service]   - Querying SQL for postIds: [${postIds.slice(0, 5).join(', ')}${postIds.length > 5 ? '...' : ''}]`)

        const sqlStartTime = Date.now()
        const posts = await this.postRepository
          .createQueryBuilder('post')
          .whereInIds(postIds)
          .leftJoinAndSelect('post.owner', 'owner')
          .leftJoinAndSelect('post.multimediaFiles', 'postMultimediaFiles')
          .leftJoinAndSelect('postMultimediaFiles.file', 'file')
          .getMany()

        console.log(`[Recommend Service] ✅ SQL query returned ${posts.length} posts in ${Date.now() - sqlStartTime}ms`)

        // 6. Preserve recommendation ranking order
        console.log(`[Recommend Service] STEP 5: Ranking posts...`)
        const rankedPosts = postIds
          .map(id => posts.find(p => p.postId === id))
          .filter((p): p is Post => p !== undefined)

        console.log(`[Recommend Service] ✅ Final result: ${rankedPosts.length} ranked posts`)

        // 7. Create RecommendationLog (without items yet)
        console.log(`[Recommend Service] STEP 6: Creating RecommendationLog...`)
        const log = await this.recommendationLogRepository.logRecommendation({
          customerId: params.customerId,
          algorithm: 'python-ml-v1',
          processingTimeMs: Date.now() - startTime,
          dinEnabled: true
        })
        console.log(`[Recommend Service] ✅ Created RecommendationLog: ${log.logId}`)

        // 7.5. Snapshot user history for DIN training
        console.log(`[Recommend Service] STEP 6.5: Snapshotting ${vecHistory.length} history items...`)
        try {
          if (vecHistory.length > 0) {
            // Need to fetch full post data for history items
            const historyPostIds = vecHistory.map(v => v.postId)
            const historyPosts = await this.postRepository.findByIds(historyPostIds)
            const historyPostMap = new Map(historyPosts.map(p => [p.postId, p]))

            const historySnapshots = vecHistory.map((interaction: UserInteraction, index: number) => {
              const post = historyPostMap.get(interaction.postId)
              return {
                recommendationLogId: log.logId,
                postId: interaction.postId,
                sequencePosition: index + 1,  // 1 = most recent
                capturedTitle: post?.title || '',
                capturedDescription: post?.description || '',
                capturedPrice: post?.price || 0,
                capturedAcreage: post?.acreage || 0,
                capturedCity: post?.city || '',
                capturedDistrict: post?.district || '',
                interactedAt: new Date(interaction.timestamp)
              }
            })

            await this.historySnapshotRepository.logHistorySnapshots(historySnapshots)
            console.log(`[Recommend Service] ✅ Snapshotted ${historySnapshots.length} history items`)
          }
        } catch (snapshotError) {
          console.error('[Recommend Service] ⚠️ History snapshot failed:', snapshotError)
          // Continue anyway - not critical for recommendation flow
        }

        // 8. Cache results with logId as key
        recommendationCache.set(log.logId, {
          recommendationLogId: log.logId,
          customerId: params.customerId,
          candidates: pythonResult.candidates,
          posts: rankedPosts
        })

        cached = recommendationCache.get(log.logId)!
        console.log(`[Recommend Service] ✅ Cached ${rankedPosts.length} posts with logId ${log.logId}`)
      }

      // 9. Slice page
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pagePosts = cached.posts.slice(start, end)
      const pageCandidates = cached.candidates.slice(start, end)

      console.log(`[Recommend Service] STEP 7: Slicing page ${page} (${start}-${end - 1}) → ${pagePosts.length} posts`)

      // 10. Log ONLY this page's items
      console.log(`[Recommend Service] STEP 8: Logging ${pagePosts.length} items for page ${page}...`)
      try {
        const itemsData = pagePosts.map((post: Post, index: number) => {
          const candidate = pageCandidates[index]
          return {
            recommendationLogId: cached!.recommendationLogId,
            postId: post.postId,
            position: start + index + 1,  // Global position
            capturedTitle: post.title,
            capturedDescription: post.description,
            capturedPrice: post.price,
            capturedAcreage: post.acreage,
            capturedCity: post.city,
            capturedDistrict: post.district,
            score: candidate?.score || 0,
            reason: candidate?.reason || 'unknown',
            explanation: null
          }
        })

        const items = await this.recommendationLogItemRepository.logItems(itemsData)
        console.log(`[Recommend Service] ✅ Logged ${items.length} recommendation items for page ${page}`)

        // Attach itemIds to posts for frontend click tracking
        pagePosts.forEach((post: Post, index: number) => {
          (post as any).recommendationLogItemId = items[index].itemId
        })
      } catch (logError) {
        console.error('[Recommend Service] ⚠️ Logging failed for page items:', logError)
      }

      console.log(`[Recommend Service] ========== END SUCCESS - Total time: ${Date.now() - startTime}ms ==========\n`)

      return {
        posts: pagePosts,
        recommendationLogId: cached.recommendationLogId,
        pagination: {
          page,
          pageSize,
          total: cached.posts.length,
          hasMore: end < cached.posts.length
        },
        processingTimeMs: Date.now() - startTime
      }
    } catch (error) {
      console.error(`[Recommend Service] ❌ ERROR in getRecommendations:`, error)
      console.error(`[Recommend Service] Error stack:`, error instanceof Error ? error.stack : 'No stack')
      console.log(`[Recommend Service] ========== END ERROR - ${Date.now() - startTime}ms ==========\n`)
      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return pythonRecommendService.healthCheck()
  }
}

export const recommendService = new RecommendService()

