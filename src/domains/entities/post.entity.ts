import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Appointment } from './appointment.entity'
import { Customer } from './customer.entity'
import { PostModerationHistory } from './post-moderator-history.entity'
import { PostMultimediaFile } from './post-multimedia-file.entity'
import { PostViewHistory } from './post-view-history.entity'
import { Rate } from './rate.entity'
import { SavedPost } from './saved-post.entity'
import { InteriorCondition } from './enum/value-object'

@Entity('Post')
@Check(`status IN ('Pending', 'Approved', 'Rejected', 'Hidden', 'Suspended')`)
@Check(`interiorCondition IN ('Full', 'None')`)
@Check(`price >= 0`)
@Check(`acreage > 0`)
export class Post {
  @PrimaryGeneratedColumn()
  postId: number

  @Column({ type: 'int', nullable: false })
  ownerId: number

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'Pending'
  })
  status: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  title: string

  @Column({ type: 'nvarchar', length: 1000, default: '' })
  description: string

  @Column({ type: 'int', nullable: false })
  price: number

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  streetNumber: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  street: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  ward: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  district: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  city: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default: InteriorCondition.NONE
  })
  interiorCondition: string

  @Column({ type: 'int', nullable: false })
  acreage: number

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  extendedAt: Date

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
}
