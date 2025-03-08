import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { AccountPenalty } from './account-penalty.entity'
import { Account } from './account.entity'
import { Appointment } from './appointment.entity'
import { InfoEdition } from './info-edition.entity'
import { Message } from './message.entity'
import { PostViewHistory } from './post-view-history.entity'
import { Post } from './post.entity'
import { Rate } from './rate.entity'
import { SavedPost } from './saved-post.entity'
import { SubscriptionAreaPost } from './subscription-area-post.entity'
import { Report } from './report.entity'
import { Participant } from './participant.entity'
import { Gender } from './enum/value-object'
import { ReportTarget } from './report-tagert.entity'

@Entity('Customer')
@Check(`gender IN ('Male', 'Female')`)
@Check(`isVerified IN (0, 1)`)
@Check(`birthday IS NULL OR birthday < GETDATE()`) // Ensure birthday is in the past if provided
export class Customer {
  @PrimaryGeneratedColumn()
  customerId: number

  @Column({ type: 'int', nullable: false })
  accountId: number

  @Column({ type: 'tinyint', default: 0 })
  isVerified: number

  @Column({
    type: "varchar",
    length: 10,
    nullable: false
  })
  gender: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  bio: string

  @Column({ type: 'varchar', length: 30, nullable: false })
  firstName: string

  @Column({ type: 'varchar', length: 30, nullable: false })
  lastName: string

  @Column({ type: 'datetime', nullable: true })
  birthday: Date

  @Column({ type: 'int', nullable: true })
  participantId: number

  @Column({ type: 'int', nullable: true, default: null })
  reportTarget: number

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

  @OneToMany(() => Report, (report) => report.sender)
  sentReports: Report[]

  @OneToOne(() => ReportTarget, (reportTarget) => reportTarget.customer)
  @JoinColumn({ name: 'reportTarget' })
  customerReportTarget: ReportTarget

  @ManyToOne(() => Participant)
  @JoinColumn({ name: 'participantId' })
  participant: Participant

  @OneToOne(() => Participant, (participant) => participant.customer)
  ownParticipant: Participant
}
