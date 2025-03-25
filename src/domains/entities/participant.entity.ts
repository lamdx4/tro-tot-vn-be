import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, Index, PrimaryGeneratedColumn } from 'typeorm'
import { Admin } from './admin.entity'
import { Customer } from './customer.entity'
import { Message } from './message.entity'

@Entity('Participant')
@Index(['typeUser', 'adminId', 'customerId'], { unique: true })
export class Participant {
  @PrimaryGeneratedColumn()
  participantId: number

  @Column({ type: 'nvarchar', length: 255 })
  typeUser: string

  @Column({ type: 'int', nullable: true })
  adminId: number

  @Column({ type: 'int', nullable: true })
  customerId: number

  @OneToOne(() => Admin, (admin) => admin.participant)
  @JoinColumn({ name: 'adminId' })
  admin: Admin

  @OneToOne(() => Customer, (customer) => customer.participant)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[]

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[]
}
