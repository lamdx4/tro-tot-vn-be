import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Appointment } from "./appointment.entity"
import { Customer } from "./customer.entity"
import { InfoEdition } from "./info-edition.entity"
import { PostModerationHistory } from "./post-moderator-history.entity"
import { PostMultimediaFile } from "./post-multimedia-file.entity"
import { PostViewHistory } from "./post-view-history.entity"
import { Rate } from "./rate.entity"
import { SavedPost } from "./saved-post.entity"
import { Report } from "./report.entity"

@Entity('Post')
export class Post {
  @PrimaryGeneratedColumn()
  postId: number

  @Column({ type: 'int' })
  ownerId: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"status" IN ('Pending', 'Approved', 'Rejected', 'Hidden', 'Suspended')`)
  status: string

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'int', nullable: true })
  price: number

  @Column({ type: 'varchar', length: 70 })
  streetNumber: string

  @Column({ type: 'varchar', length: 70 })
  street: string

  @Column({ type: 'varchar', length: 70 })
  ward: string

  @Column({ type: 'varchar', length: 70 })
  district: string

  @Column({ type: 'varchar', length: 70 })
  city: string

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"interiorCondition" IN ('Full', 'None')`)
  interiorCondition: string

  @Column({ type: 'int', nullable: true })
  acreage: number

  @Column({ type: 'int', nullable: true })
  deposit: number

  @Column({ type: 'datetime', nullable: true })
  extendedAt: Date

  @Column({ type: 'int' })
  version: number

  @ManyToOne(() => Customer, (customer) => customer.posts)
  @JoinColumn({ name: 'ownerId' })
  owner: Customer

  @OneToMany(() => InfoEdition, (infoEdition) => infoEdition.post)
  infoEditions: InfoEdition[]

  @OneToMany(() => PostModerationHistory, (history) => history.post)
  moderationHistories: PostModerationHistory[]

  @OneToMany(() => SavedPost, (savedPost) => savedPost.post)
  savedPosts: SavedPost[]

  @OneToMany(() => Appointment, (appointment) => appointment.post)
  appointments: Appointment[]

  @OneToMany(() => PostMultimediaFile, (file) => file.post)
  multimediaFiles: PostMultimediaFile[]

  @OneToMany(() => Rate, (rate) => rate.post)
  rates: Rate[]

  @OneToMany(() => PostViewHistory, (viewHistory) => viewHistory.post)
  viewHistories: PostViewHistory[]

  @OneToMany(()=> Report, (report) => report.post)
  reports: Report[]


}