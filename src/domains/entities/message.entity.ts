import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Customer } from './customer.entity'
import { Admin } from './admin.entity'
import { Participant } from './participant.entity'

@Entity('Message')
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number

  @Column({ type: 'int', nullable: false })
  senderId: number

  @Column({ type: 'int', nullable: false })
  receiverId: number

  @Column({ type: 'varchar', length: 150 })
  content: string

  @ManyToOne(() => Participant, (participant) => participant.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: Participant

  @ManyToOne(() => Participant, (participant) => participant.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver: Participant
}
