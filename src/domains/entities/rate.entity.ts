import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Check,
  OneToOne,
  Index
} from 'typeorm'
import { Customer } from './customer.entity'
import { Post } from './post.entity'

@Entity('Rate')
@Index(['raterId', 'postId'], { unique: true })
export class Rate {
  @PrimaryGeneratedColumn()
  rateId: number

  @Column({ type: 'int' })
  raterId: number

  @Column({ type: 'int' })
  @Check(`"numRate" BETWEEN 1 AND 5`)
  numRate: number

  @Column({ type: 'nvarchar', length: 100, nullable: true, default: '' })
  comment: string

  @Column({
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  createdAt: Date

  @Column({ type: 'int' })
  postId: number

  @ManyToOne(() => Customer, (customer) => customer.rates)
  @JoinColumn({ name: 'raterId' })
  rater: Customer

  @ManyToOne(() => Post, (post) => post.rates)
  @JoinColumn({ name: 'postId' })
  post: Post
}
