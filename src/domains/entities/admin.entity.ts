import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Account } from "./account.entity"
import { Message } from "./message.entity"
import { PostModerationHistory } from "./post-moderator-history.entity"
import { Report } from "./report.entity"

@Entity('Admin')
export class Admin {
  @PrimaryGeneratedColumn()
  adminId: number

  @Column({ type: 'int' })
  accountId: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"gender" IN ('Female', 'Male')`)
  gender: string

  @Column({ type: 'varchar', length: 30 })
  firstName: string

  @Column({ type: 'varchar', length: 30 })
  lastName: string

  @Column({ type: 'datetime' })
  birthday: Date

  @ManyToOne(() => Account, (account) => account.admins)
  @JoinColumn({ name: 'accountId' })
  account: Account

  @OneToMany(() => PostModerationHistory, (history) => history.admin)
  moderationHistories: PostModerationHistory[]

  @OneToMany(() => Message, (message) => message.senderAdmin)
  sentMessages: Message[]

  @OneToMany(() => Message, (message) => message.receiverAdmin)
  receivedMessages: Message[]

  @OneToMany(() => Report, (report) => report.handler)
  reports: Report[]
}
