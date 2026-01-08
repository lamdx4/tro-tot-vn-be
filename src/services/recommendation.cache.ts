export interface CachedRecommendation {
    recommendationLogId: number  // Cache key
    customerId: number
    candidates: any[]  // From Python ML service
    posts: any[]  // Enriched Post objects
    timestamp: Date
    expiresAt: Date
}

/**
 * In-memory cache for recommendation results
 * Key: recommendationLogId, Value: CachedRecommendation
 */
class RecommendationCache {
    private cache: Map<number, CachedRecommendation>
    private readonly DEFAULT_TTL_MINUTES = 30

    constructor() {
        this.cache = new Map()

        // Clean up expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }

    get(logId: number): CachedRecommendation | null {
        const cached = this.cache.get(logId)

        if (!cached) {
            return null
        }

        // Check expiry
        if (new Date() > cached.expiresAt) {
            this.cache.delete(logId)
            return null
        }

        return cached
    }

    set(logId: number, data: Omit<CachedRecommendation, 'timestamp' | 'expiresAt'>) {
        const now = new Date()
        const cached: CachedRecommendation = {
            ...data,
            timestamp: now,
            expiresAt: new Date(now.getTime() + this.DEFAULT_TTL_MINUTES * 60 * 1000)
        }

        this.cache.set(logId, cached)
    }

    invalidate(logId: number) {
        this.cache.delete(logId)
    }

    private cleanup() {
        const now = new Date()
        for (const [logId, cached] of this.cache.entries()) {
            if (now > cached.expiresAt) {
                this.cache.delete(logId)
            }
        }
    }

    clear() {
        this.cache.clear()
    }
}

export const recommendationCache = new RecommendationCache()
