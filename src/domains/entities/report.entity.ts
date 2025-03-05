import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { AccountPenalty } from "./account-penalty.entity"
import { ActionTaken } from "./action-taken.entity"
import { Customer } from "./customer.entity"
import { Post } from "./post.entity"
import { Rate } from "./rate.entity"
import { Admin } from "./admin.entity"

@Entity('Report')
export class Report {
  @PrimaryGeneratedColumn()
  reportId: number

  @Column({ type: 'int' })
  senderId: number

  @Column({ type: 'int' })
  entityId: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"entityType" IN ('Post', 'Rate', 'User')`)
  entityType: string

  @Column({ type: 'varchar', length: 20 })
  @Check(`"status" IN ('Pending', 'Done')`)
  status: string

  @Column({type : 'varchar', length: 255})
  detail: string

  @CreateDateColumn()
  createdAt: Date

  @Column({ type : 'int', nullable: true })
  handlerId: number

  @Column({ type: 'int' })
  actionTaken: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolutionMessage: string

  @CreateDateColumn()
  resolvedAt: Date

  @ManyToOne(() => Customer, (customer) => customer.reports)
  @JoinColumn({ name: 'senderId' })
  sender: Customer

  @ManyToOne(() => Post, (post) => post.reports)
  @JoinColumn({ name: 'entityId' })
  post: Post

  @ManyToOne(() => Rate, (rate) => rate.reports)
  @JoinColumn({ name: 'entityId' })
  rate: Rate

  @ManyToOne(() => ActionTaken, (action) => action.reports)
  @JoinColumn({ name: 'actionTaken' })
  action: ActionTaken

  @ManyToOne(() => Admin, (admin) => admin.reports)
  @JoinColumn({ name: 'handlerId' })
  handler: Admin

  @OneToMany(() => AccountPenalty, (penalty) => penalty.report)
  penalties: AccountPenalty[]
}