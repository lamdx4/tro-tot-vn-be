import { Entity, PrimaryGeneratedColumn, Column, Check, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { Account } from './account.entity'
import { PostModerationHistory } from './post-moderator-history.entity'
import { Participant } from './participant.entity'
import { Gender } from './enum/value-object'

@Entity('Admin')
@Check(`gender IN ('Male', 'Female')`)
@Check(`birthday < GETDATE()`) // Ensure birthday is in the past
export class Admin {
  @PrimaryGeneratedColumn({ type: 'int' })
  adminId: number

  @Column({ type: 'int', nullable: false })
  accountId: number

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    default : Gender.MALE
  })
  gender: string

  @Column({ type: 'varchar', length: 30, nullable: false })
  firstName: string

  @Column({ type: 'varchar', length: 30, nullable: false })
  lastName: string

  @Column({ type: 'date', nullable: false })
  birthday: Date

  @OneToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account

  @OneToMany(() => PostModerationHistory, (history) => history.admin)
  moderationHistories: PostModerationHistory[]

  @OneToOne(() => Participant, (participant) => participant.admin)
  participant: Participant
}
