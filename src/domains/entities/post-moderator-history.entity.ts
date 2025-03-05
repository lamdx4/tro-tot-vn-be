import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Post } from "./post.entity"
import { Admin } from "./admin.entity"

@Entity('PostModerationHistory')
export class PostModerationHistory {
  @PrimaryGeneratedColumn()
  historyId: number


  @Column({ type: 'int' })
  postId: number


  @Column({ type: 'int' })
  version: number


  @Column({ type: 'int' })
  adminId: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"actionType" IN ('Approved', 'Rejected', 'Suspended')`)
  actionType: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string

  @CreateDateColumn()
  execAt: Date

  @ManyToOne(() => Post, (post) => post.moderationHistories)
  @JoinColumn({ name: 'postId' })
  post: Post

  @ManyToOne(() => Admin, (admin) => admin.moderationHistories)
  @JoinColumn({ name: 'adminId' })
  admin: Admin
}