import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm'
import { SearchLog } from './search-log.entity'
import { SearchClick } from './search-click.entity'

@Entity('SearchLogItem')
@Index(['searchLogId'])
export class SearchLogItem {
  @PrimaryGeneratedColumn()
  itemId: number

  @Column({ type: 'int', nullable: false })
  searchLogId: number

  @Column({ type: 'int', nullable: true })
  postId: number | null

  @Column({ type: 'int', nullable: false })
  position: number

  @Column({ type: 'float', nullable: true })
  relevanceScore: number | null

  // SNAPSHOT (from Node.js SQL query)
  @Column({ type: 'nvarchar', length: 500, nullable: false })
  capturedTitle: string

  @Column({ type: 'nvarchar', length: 'MAX', nullable: false, default: '' })
  capturedDescription: string

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  capturedPrice: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  capturedAcreage: number

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  capturedCity: string

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  capturedDistrict: string

  // Relations
  @ManyToOne(() => SearchLog, searchLog => searchLog.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'searchLogId' })
  searchLog: SearchLog

  @OneToMany(() => SearchClick, click => click.searchLogItem)
  clicks: SearchClick[]
}

