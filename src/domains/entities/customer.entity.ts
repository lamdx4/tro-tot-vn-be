import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { AccountPenalty } from "./account-penalty.entity"
import { Account } from "./account.entity"
import { Appointment } from "./appointment.entity"
import { InfoEdition } from "./info-edition.entity"
import { Message } from "./message.entity"
import { PostViewHistory } from "./post-view-history.entity"
import { Post } from "./post.entity"
import { Rate } from "./rate.entity"
import { SavedPost } from "./saved-post.entity"
import { SubscriptionAreaPost } from "./subscription-area-post.entity"
import { Report } from "./report.entity"

@Entity('Customer')
export class Customer {
  @PrimaryGeneratedColumn()
  customerId: number


  @Column({ type: 'int' })
  accountId: number

  @Column({ type: 'tinyint', default: 0 })
  isVerified: boolean

  @Column({ type: 'varchar', length: 20 })
  @Check(`"gender" IN ('Female', 'Male')`)
  gender: string

  @Column({ type: 'varchar', length: 150, default: '' })
  bio: string

  @Column({ type: 'varchar', length: 30 })
  firstName: string

  @Column({ type: 'varchar', length: 30 })
  lastName: string

  @Column({ type: 'datetime', nullable: true })
  birthday: Date

  @ManyToOne(() => Account, (account) => account.customers)
  @JoinColumn({ name: 'accountId' })
  account: Account

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[]

  @OneToMany(() => InfoEdition, (infoEdition) => infoEdition.post)
  infoEditions: InfoEdition[]

  @OneToMany(() => SavedPost, (savedPost) => savedPost.customer)
  savedPosts: SavedPost[]

  @OneToMany(() => Appointment, (appointment) => appointment.requester)
  appointments: Appointment[]

  @OneToMany(() => Rate, (rate) => rate.rater)
  rates: Rate[]


  @OneToMany(() => PostViewHistory, (viewHistory) => viewHistory.customer)
  viewHistories: PostViewHistory[]

  @OneToMany(() => SubscriptionAreaPost, (subscription) => subscription.customer)
  subscriptions: SubscriptionAreaPost[]

  @OneToMany(() => Message, (message) => message.senderCustomer)
  sentMessages: Message[]

  @OneToMany(() => Message, (message) => message.receiverCustomer)
  receivedMessages: Message[]

  @OneToMany(() => Report, (report) => report.sender)
  reports: Report[]

  @OneToMany(() => AccountPenalty, (penalty) => penalty.penaltyAccount)
  penalties: AccountPenalty[]

}