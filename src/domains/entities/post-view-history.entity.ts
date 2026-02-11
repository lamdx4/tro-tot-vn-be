import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'
import { Post } from './post.entity'

@Entity('PostViewHistory')
@Index(['postId', 'customerId'], { unique: true })
export class PostViewHistory {
  @PrimaryGeneratedColumn()
  historyId: number

  @Column({ type: 'int', nullable: false })
  customerId: number

  @Column({ type: 'int', nullable: false })
  postId: number

  @Column({
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  viewedAt: Date

  @ManyToOne(() => Customer, (customer) => customer.viewHistories)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @ManyToOne(() => Post, (post) => post.viewHistories)
  @JoinColumn({ name: 'postId' })
  post: Post
}
