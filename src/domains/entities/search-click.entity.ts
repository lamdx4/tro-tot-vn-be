import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { SearchLog } from './search-log.entity'
import { SearchLogItem } from './search-log-item.entity'

@Entity('SearchClick')
@Index(['searchLogItemId'])
export class SearchClick {
  @PrimaryGeneratedColumn()
  clickId: number

  @Column({ type: 'int', nullable: false })
  searchLogId: number

  @Column({ type: 'int', nullable: false })
  searchLogItemId: number

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  clickedAt: Date

  // Relations
  @ManyToOne(() => SearchLog, searchLog => searchLog.clicks, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'searchLogId' })
  searchLog: SearchLog

  @ManyToOne(() => SearchLogItem, item => item.clicks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'searchLogItemId' })
  searchLogItem: SearchLogItem
}

