import { Entity, PrimaryGeneratedColumn, Column, Check, Index } from 'typeorm'

@Entity('ModerationLog')
@Check(`moderationType IN ('AI_REJECT', 'ADMIN_REJECT')`)
@Index(['moderationType'])
export class ModerationLog {
  @PrimaryGeneratedColumn()
  logId: number

  @Column({ type: 'nvarchar', length: 500, nullable: false })
  capturedTitle: string

  @Column({ type: 'nvarchar', length: 'MAX', nullable: false })
  capturedDescription: string

  @Column({ type: 'float', nullable: false })
  aiScore: number

  @Column({ type: 'float', nullable: false })
  aiThreshold: number

  @Column({ 
    type: 'varchar', 
    length: 20, 
    nullable: false 
  })
  moderationType: 'AI_REJECT' | 'ADMIN_REJECT'

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  moderatedAt: Date
}

