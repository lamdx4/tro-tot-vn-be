import { pythonRecommendService, UserInteraction, UserProfile } from './python-recommend.service'
import { PostRepository } from '../infras/repositories/post.repository'
import { UserInteractionLogRepository } from '../infras/repositories/user-interaction-log.repository'
import { CustomerRepository } from '../infras/repositories/customer.repository'
import { Post } from '../domains/entities/post.entity'

export interface RecommendParams {
  customerId: number
  limit?: number
}

export interface RecommendResult {
  posts: Post[]
  total: number
  processingTimeMs: number
}

class RecommendService {
  private postRepository: PostRepository
  private interactionLogRepository: UserInteractionLogRepository
  private customerRepository: CustomerRepository

  constructor() {
    this.postRepository = new PostRepository()
    this.interactionLogRepository = new UserInteractionLogRepository()
    this.customerRepository = new CustomerRepository()
  }

  /**
   * Collect user interaction history from database
   */
  private async collectUserHistory(customerId: number): Promise<UserInteraction[]> {
    console.log(`[Recommend Service] 📊 Querying UserInteractionLog for customer ${customerId}...`)

    // Get last 200 interactions (view/save/contact combined)
    const logs = await this.interactionLogRepository.findRecentByCustomer(customerId, 200)

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
   * Get personalized recommendations for a customer
   */
  async getRecommendations(params: RecommendParams): Promise<RecommendResult> {
    const startTime = Date.now()
    const limit = params.limit || 20

    console.log(`\n[Recommend Service] ========== START: Getting recommendations for customer ${params.customerId}, limit=${limit} ==========`)

    try {
      // 1. Collect user interaction history
      console.log(`[Recommend Service] STEP 1: Collecting interaction history...`)
      const vecHistory = await this.collectUserHistory(params.customerId)

      // 2. Build user profile
      console.log(`[Recommend Service] STEP 2: Building user profile...`)
      const userProfile = await this.buildUserProfile(params.customerId)
      console.log(`[Recommend Service] ✅ User profile:`, userProfile)

      // HOT/WARM START: Use Python ML service
      console.log(`[Recommend Service] 🔀 ROUTING: History size ${vecHistory.length} >= 5 → HOT START (Python ML service)`)

      // 3. Call Python recommend service
      console.log(`[Recommend Service] STEP 3: Calling Python service with ${vecHistory.length} interactions...`)
      const pythonStartTime = Date.now()

      const pythonResult = await pythonRecommendService.recommend({
        vecHistory,
        userProfile,
        limit
      })

      console.log(`[Recommend Service] ✅ Python service returned ${pythonResult.candidates.length} candidates in ${Date.now() - pythonStartTime}ms`)

      if (pythonResult.candidates.length === 0) {
        console.log('[Recommend Service] ⚠️ No candidates returned from Python service - returning empty')
        console.log(`[Recommend Service] ========== END (no candidates) - ${Date.now() - startTime}ms ==========\n`)
        return {
          posts: [],
          total: 0,
          processingTimeMs: Date.now() - startTime
        }
      }

      // 4. Enrich with full post data from SQL
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

      // 5. Preserve recommendation ranking order
      console.log(`[Recommend Service] STEP 5: Ranking posts...`)
      const rankedPosts = postIds
        .map(id => posts.find(p => p.postId === id))
        .filter((p): p is Post => p !== undefined)

      console.log(`[Recommend Service] ✅ Final result: ${rankedPosts.length} ranked posts`)
      console.log(`[Recommend Service] ========== END SUCCESS - Total time: ${Date.now() - startTime}ms ==========\n`)

      return {
        posts: rankedPosts,
        total: rankedPosts.length,
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

