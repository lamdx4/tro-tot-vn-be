import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne
} from 'typeorm'
import { Appointment } from './appointment.entity'
import { Customer } from './customer.entity'
import { InfoEdition } from './info-edition.entity'
import { PostModerationHistory } from './post-moderator-history.entity'
import { PostMultimediaFile } from './post-multimedia-file.entity'
import { PostViewHistory } from './post-view-history.entity'
import { Rate } from './rate.entity'
import { SavedPost } from './saved-post.entity'
import { Report } from './report.entity'
import { ReportTarget } from './report-tagert.entity'
import { InteriorCondition, PostStatus } from './enum/value-object'

@Entity('Post')@Check(`status IN ('Pending', 'Approved', 'Rejected', 'Hidden', 'Suspended')`)
@Check(`interiorCondition IN ('Full', 'None')`)
@Check(`price >= 0`)
@Check(`acreage > 0`)
@Check(`deposit >= 0`)
@Check(`version >= 1`)
export class Post {
  @PrimaryGeneratedColumn()
  postId: number

  @Column({ type: 'int', nullable: true })
  ownerId: number

  @Column({
    type: "varchar",
    length: 20,
    nullable: false
  })
  status: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'int', nullable: true })
  price: number

  @Column({ type: 'varchar', length: 70, nullable: false })
  streetNumber: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  street: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  ward: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  district: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  city: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({
    type: "varchar",
    length: 10,
    nullable: false,
    default : "None"
  })
  interiorCondition: string;

  @Column({ type: 'int', nullable: true })
  acreage: number

  @Column({ type: 'int', nullable: true })
  deposit: number

  @Column({ type: 'datetime', nullable: true })
  extendedAt: Date

  @Column({ type: 'int', nullable: false })
  version: number

  @Column({ type: 'int', nullable: true, default: null })
  reportTarget: number

  @ManyToOne(() => Customer, (customer) => customer.posts)
  @JoinColumn({ name: 'ownerId' })
  owner: Customer

  @OneToMany(() => PostMultimediaFile, (postFile) => postFile.post)
  multimediaFiles: PostMultimediaFile[]

  @OneToMany(() => Rate, (rate) => rate.post)
  rates: Rate[]

  @OneToMany(() => PostViewHistory, (history) => history.post)
  viewHistories: PostViewHistory[]

  @OneToMany(() => SavedPost, (savedPost) => savedPost.post)
  savedBy: SavedPost[]

  @OneToMany(() => Appointment, (appointment) => appointment.post)
  appointments: Appointment[]

  @OneToMany(() => PostModerationHistory, (history) => history.post)
  moderationHistories: PostModerationHistory[]

  @OneToMany(() => InfoEdition, (info) => info.post)
  infoEditions: InfoEdition[]

  @OneToOne(() => ReportTarget, (reportTarget) => reportTarget.post)
  @JoinColumn({ name: 'reportTarget' })
  postReportTarget: ReportTarget
}
