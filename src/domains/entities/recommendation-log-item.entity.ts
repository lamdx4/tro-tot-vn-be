import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm'
import { RecommendationLog } from './recommendation-log.entity'
import { RecommendationClick } from './recommendation-click.entity'

@Entity('RecommendationLogItem')
@Index(['recommendationLogId'])
export class RecommendationLogItem {
  @PrimaryGeneratedColumn()
  itemId: number

  @Column({ type: 'int', nullable: false })
  recommendationLogId: number

  @Column({ type: 'int', nullable: true })
  postId: number | null

  @Column({ type: 'int', nullable: false })
  position: number

  // SNAPSHOT (from Node.js SQL query)
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

  // Scores from Python service
  @Column({ type: 'float', nullable: false })
  score: number

  @Column({ type: 'varchar', nullable: true })
  reason: string | null

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  explanation: string | null

  // Relations
  @ManyToOne(() => RecommendationLog, log => log.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recommendationLogId' })
  recommendationLog: RecommendationLog

  @OneToMany(() => RecommendationClick, click => click.recommendationLogItem)
  clicks: RecommendationClick[]
}

