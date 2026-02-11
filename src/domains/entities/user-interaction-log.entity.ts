import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'
import { Post } from './post.entity'

@Entity('UserInteractionLog')
@Index(['customerId', 'postId', 'typeAction'])
export class UserInteractionLog {
  @PrimaryGeneratedColumn()
  logId: number

  @Column({ type: 'int', nullable: false })
  customerId: number

  @Column({ type: 'int', nullable: false })
  postId: number

  @Column({ 
    type: 'tinyint', 
    nullable: false,
    comment: '1=view, 2=save, 3=contact'
  })
  typeAction: 1 | 2 | 3

  @Column({
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  createdAt: Date

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post
}

