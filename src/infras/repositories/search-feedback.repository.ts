import { SearchFeedback } from '../../domains/entities/search-feedback.entity'
import { BaseRepository } from './base.repository'

export class SearchFeedbackRepository extends BaseRepository<SearchFeedback> {
    constructor() {
        super(SearchFeedback)
    }

    /**
     * Save user feedback on search results
     */
    async saveFeedback(data: {
        searchLogId: number
        isHelpful: boolean
        issues?: string[]
        comment?: string
    }): Promise<SearchFeedback> {
        const feedback = this.create({
            searchLogId: data.searchLogId,
            isHelpful: data.isHelpful,
            issues: data.issues ? JSON.stringify(data.issues) : null,
            comment: data.comment || null
        })

        return this.save(feedback)
    }

    /**
     * Get feedback statistics
     */
    async getFeedbackStats(startDate?: Date): Promise<any> {
        const qb = this.createQueryBuilder('fb')
            .select('COUNT(*)', 'total')
            .addSelect('SUM(CASE WHEN fb.isHelpful = 1 THEN 1 ELSE 0 END)', 'helpfulCount')
            .addSelect('SUM(CASE WHEN fb.isHelpful = 0 THEN 1 ELSE 0 END)', 'notHelpfulCount')

        if (startDate) {
            qb.where('fb.createdAt >= :startDate', { startDate })
        }

        const result = await qb.getRawOne()

        return {
            total: parseInt(result.total),
            helpful: parseInt(result.helpfulCount),
            notHelpful: parseInt(result.notHelpfulCount),
            helpfulnessRate: result.total > 0
                ? (parseInt(result.helpfulCount) / parseInt(result.total)) * 100
                : 0
        }
    }

    /**
     * Get common issues from negative feedback
     */
    async getCommonIssues(limit: number = 10): Promise<any[]> {
        const feedbacks = await this.find({
            where: { isHelpful: false },
            select: ['issues'],
            order: { createdAt: 'DESC' },
            take: 500
        })

        // Parse and count issues
        const issueCounts: Record<string, number> = {}

        feedbacks.forEach(fb => {
            if (fb.issues) {
                try {
                    const issues = JSON.parse(fb.issues) as string[]
                    issues.forEach(issue => {
                        issueCounts[issue] = (issueCounts[issue] || 0) + 1
                    })
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        })

        // Convert to array and sort
        return Object.entries(issueCounts)
            .map(([issue, count]) => ({ issue, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
    }
}
