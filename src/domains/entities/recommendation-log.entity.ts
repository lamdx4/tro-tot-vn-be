import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Customer } from './customer.entity'
import { RecommendationLogItem } from './recommendation-log-item.entity'
import { RecommendationClick } from './recommendation-click.entity'

@Entity('RecommendationLog')
@Index(['customerId'])
@Index(['createdAt'])
export class RecommendationLog {
  @PrimaryGeneratedColumn()
  logId: number

  @Column({ type: 'int', nullable: false })
  customerId: number

  @Column({ type: 'varchar', length: 50, nullable: false })
  algorithm: string

  @Column({ type: 'float', nullable: false })
  processingTimeMs: number

  @Column({ type: 'bit', default: () => '0' })
  dinEnabled: boolean

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date

  // Relations
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @OneToMany(() => RecommendationLogItem, item => item.recommendationLog)
  items: RecommendationLogItem[]

  @OneToMany(() => RecommendationClick, click => click.recommendationLog)
  clicks: RecommendationClick[]
}

