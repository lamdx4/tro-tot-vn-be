import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { RecommendationLog } from './recommendation-log.entity'
import { RecommendationLogItem } from './recommendation-log-item.entity'

@Entity('RecommendationClick')
@Index(['recommendationLogItemId'])
export class RecommendationClick {
  @PrimaryGeneratedColumn()
  clickId: number

  @Column({ type: 'int', nullable: false })
  recommendationLogId: number

  @Column({ type: 'int', nullable: false })
  recommendationLogItemId: number

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  clickedAt: Date

  // Relations
  @ManyToOne(() => RecommendationLog, log => log.clicks, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'recommendationLogId' })
  recommendationLog: RecommendationLog

  @ManyToOne(() => RecommendationLogItem, item => item.clicks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendationLogItemId' })
  recommendationLogItem: RecommendationLogItem
}

