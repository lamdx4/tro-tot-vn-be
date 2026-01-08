import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { RecommendationLog } from './recommendation-log.entity'

@Entity('RecommendationHistorySnapshot')
@Index(['recommendationLogId'])
@Index(['postId'])
export class RecommendationHistorySnapshot {
    @PrimaryGeneratedColumn()
    snapshotId: number

    @Column({ type: 'int', nullable: false })
    recommendationLogId: number

    @Column({ type: 'int', nullable: false })
    postId: number

    @Column({ type: 'int', nullable: false })
    sequencePosition: number  // Order in history (1 = most recent)

    // SNAPSHOT POST FEATURES (at time of interaction)
    @Column({ type: 'nvarchar', length: 500, nullable: false })
    capturedTitle: string

    @Column({ type: 'nvarchar', length: 'MAX', nullable: false })
    capturedDescription: string

    @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
    capturedPrice: number

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    capturedAcreage: number

    @Column({ type: 'nvarchar', length: 100, nullable: false })
    capturedCity: string

    @Column({ type: 'nvarchar', length: 100, nullable: false })
    capturedDistrict: string

    @Column({ type: 'datetime', nullable: false })
    interactedAt: Date  // Original interaction timestamp

    // Relations
    @ManyToOne(() => RecommendationLog, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recommendationLogId' })
    recommendationLog: RecommendationLog
}
