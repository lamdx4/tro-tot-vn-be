import AppDataSource from '../db/datasource'
import { RecommendationHistorySnapshot } from '../../domains/entities/recommendation-history-snapshot.entity'

export class RecommendationHistorySnapshotRepository {
    private repository = AppDataSource.getRepository(RecommendationHistorySnapshot)

    /**
     * Bulk insert history snapshots for a recommendation session
     */
    async logHistorySnapshots(snapshots: Array<{
        recommendationLogId: number
        postId: number
        sequencePosition: number
        capturedTitle: string
        capturedDescription: string
        capturedPrice: number
        capturedAcreage: number
        capturedCity: string
        capturedDistrict: string
        interactedAt: Date
    }>): Promise<RecommendationHistorySnapshot[]> {
        console.log(`[HistorySnapshotRepo] Logging ${snapshots.length} history snapshots...`)

        const entities = snapshots.map(data =>
            this.repository.create(data)
        )

        const result = await this.repository.save(entities)
        console.log(`[HistorySnapshotRepo] ✅ Saved ${result.length} history snapshots`)

        return result
    }

    /**
     * Get history snapshot for a recommendation session
     */
    async getHistoryByRecommendationLogId(recommendationLogId: number): Promise<RecommendationHistorySnapshot[]> {
        return this.repository.find({
            where: { recommendationLogId },
            order: { sequencePosition: 'ASC' }
        })
    }
}
