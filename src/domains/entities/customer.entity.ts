import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { Account } from './account.entity'
import { Appointment } from './appointment.entity'
import { PostViewHistory } from './post-view-history.entity'
import { Post } from './post.entity'
import { Rate } from './rate.entity'
import { SavedPost } from './saved-post.entity'
import { SubscriptionAreaPost } from './subscription-area-post.entity'
import { Participant } from './participant.entity'
import { MultimediaFile } from './multimedia-file.entity'

@Entity('Customer')
@Check(`gender IN ('Male', 'Female')`)
@Check(`isVerified IN (0, 1)`)
@Check(`birthday IS NULL OR birthday < GETDATE()`) // Ensure birthday is in the past if provided
export class Customer {
  @PrimaryGeneratedColumn({ type: 'int' })
  customerId: number

  @Column({ type: 'int', nullable: false })
  accountId: number

  @Column({ type: 'tinyint', default: 0 })
  isVerified: number

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default: 'Male'
  })
  gender: string

  @Column({ type: 'nvarchar', length: 150, default: '' })
  bio: string

  @Column({ type: 'nvarchar', length: 30, nullable: false })
  firstName: string

  @Column({ type: 'nvarchar', length: 30, nullable: false })
  lastName: string

  @Column({ type: 'date', nullable: true })
  birthday: Date

  @Column({ type: 'int', nullable: true })
  avatar: number

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  address: string

  @Column({
    type: 'date',
    default: () => 'CURRENT_TIMESTAMP'
  })
  joinedAt: Date

  @OneToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[]

  @OneToMany(() => SavedPost, (savedPost) => savedPost.customer)
  savedPosts: SavedPost[]

  @OneToMany(() => Rate, (rate) => rate.rater)
  rates: Rate[]

  @OneToMany(() => PostViewHistory, (history) => history.customer)
  viewHistories: PostViewHistory[]

  @OneToMany(() => Appointment, (appointment) => appointment.requester)
  appointments: Appointment[]

  @OneToMany(() => SubscriptionAreaPost, (subscription) => subscription.customer)
  subscriptions: SubscriptionAreaPost[]

  @OneToOne(() => Participant, (participant) => participant.customer)
  participant: Participant

  @OneToOne(() => MultimediaFile, (file) => file.customer)
  avatarFile: MultimediaFile
}
