import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Index } from 'typeorm'
import { SearchLog } from './search-log.entity'

@Entity('SearchFeedback')
@Index(['searchLogId'], { unique: true })
@Index(['createdAt'])
export class SearchFeedback {
    @PrimaryGeneratedColumn()
    feedbackId: number

    @Column({ type: 'int', nullable: false })
    searchLogId: number

    @Column({ type: 'bit', nullable: false })
    isHelpful: boolean

    @Column({ type: 'nvarchar', length: 500, nullable: true })
    issues: string | null

    @Column({ type: 'nvarchar', length: 1000, nullable: true })
    comment: string | null

    @Column({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date

    // Relations
    @OneToOne(() => SearchLog, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'searchLogId' })
    searchLog: SearchLog
}
