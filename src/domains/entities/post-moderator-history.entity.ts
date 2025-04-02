import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Post } from './post.entity'
import { Admin } from './admin.entity'
import { ActionType } from './enum/value-object'

@Entity('PostModerationHistory')
@Check(`actionType IN ('Approved', 'Rejected', 'Suspended')`)
export class PostModerationHistory {
  @PrimaryGeneratedColumn()
  historyId: number

  @Column({ type: 'int', nullable: false })
  postId: number

  @Column({ type: 'int', nullable: false })
  adminId: number

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  actionType: string

  @Column({ type: 'nvarchar', length: 255, default: null, nullable: true })
  reason: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  execAt: Date

  @ManyToOne(() => Post, (post) => post.moderationHistories)
  @JoinColumn({ name: 'postId' })
  post: Post

  @ManyToOne(() => Admin, (admin) => admin.moderationHistories)
  @JoinColumn({ name: 'adminId' })
  admin: Admin
}
