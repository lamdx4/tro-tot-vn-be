import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, OneToOne } from 'typeorm'
import { SearchLogItem } from './search-log-item.entity'
import { SearchClick } from './search-click.entity'
import { SearchFeedback } from './search-feedback.entity'

@Entity('SearchLog')
@Index(['customerId'])
@Index(['createdAt'])
export class SearchLog {
  @PrimaryGeneratedColumn()
  logId: number

  @Column({ type: 'int', nullable: true })
  customerId: number | null

  @Column({ type: 'nvarchar', length: 500, nullable: false })
  query: string

  // Filters
  @Column({ type: 'nvarchar', length: 100, nullable: true })
  city: string | null

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  district: string | null

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  minPrice: number | null

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maxPrice: number | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAcreage: number | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAcreage: number | null

  @Column({ type: 'varchar', length: 20, nullable: true })
  interiorCondition: string | null

  // Results metadata
  @Column({ type: 'int', nullable: false })
  resultCount: number

  @Column({ type: 'float', nullable: false })
  searchTimeMs: number

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  // Relations
  @OneToMany(() => SearchLogItem, item => item.searchLog)
  items: SearchLogItem[]

  @OneToMany(() => SearchClick, click => click.searchLog)
  clicks: SearchClick[]

  @OneToOne(() => SearchFeedback, feedback => feedback.searchLog)
  feedback: SearchFeedback | null
}
