import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Customer } from './customer.entity'
import { Post } from './post.entity'

@Entity('SavedPost')
export class SavedPost {
  @PrimaryColumn({ type: 'int' })
  customerId: number

  @PrimaryColumn({ type: 'int' })
  postId: number

  @Column({
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.savedPosts)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @ManyToOne(() => Post, (post) => post.savedBy)
  @JoinColumn({ name: 'postId' })
  post: Post
}
