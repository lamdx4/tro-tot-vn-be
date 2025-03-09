import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Message } from './message.entity'
import { Customer } from './customer.entity'
import { Admin } from './admin.entity'
import { EntityMemberType } from './enum/value-object'

@Entity('Participant')
@Check(`typeUser IN ('Admin', 'Customer')`)
@Check(`
  (typeUser = 'Admin' AND adminId IS NOT NULL AND customerId IS NULL) OR
  (typeUser = 'Customer' AND customerId IS NOT NULL AND adminId IS NULL)
`) // Ensure that only the appropriate ID is set based on typeUser
export class Participant {
  @PrimaryGeneratedColumn()
  participantId: number

  @Column({
    type: "varchar",
    length: 20,
    nullable: false
  })
  typeUser: string

  @Column({ type: 'int', nullable: true })
  adminId: number

  @Column({ type: 'int', nullable: true })
  customerId: number

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'adminId' })
  admin: Admin

  @OneToOne(() => Customer, (customer) => customer.ownParticipant)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[]

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[]
}
