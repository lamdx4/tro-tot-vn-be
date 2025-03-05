import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./customer.entity"
import { Post } from "./post.entity"

@Entity('PostViewHistory')
export class PostViewHistory {
  @PrimaryGeneratedColumn()
  historyId: number

  @Column({ type: 'int' })
  customerId: number

  @Column({ type: 'int' })
  postId: number

  @CreateDateColumn()
  viewedAt: Date

  @ManyToOne(() => Customer, (customer) => customer.viewHistories)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @ManyToOne(() => Post, (post) => post.viewHistories)
  @JoinColumn({ name: 'postId' })
  post: Post
}