import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm'
import { ConversationType } from './enum/value-object'
import { Customer } from './customer.entity'
import { Message } from './message.entity'
import { ConversationParticipant } from './conversation-participant.entity'

@Entity('Conversation')
@Index(['createdBy', 'createdAt'])
export class Conversation {
  @PrimaryGeneratedColumn()
  conversationId: number

  @Column({ type: 'nvarchar', length: 20, default: ConversationType.DIRECT })
  conversationType: string

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  groupName?: string

  @Column({ type: 'int', nullable: false })
  createdBy: number

  @Column({
    type: 'datetime2',
    nullable: false
  })
  createdAt: Date

  @Column({
    type: 'datetime2',
    nullable: false
  })
  updatedAt: Date

  // Relationships
  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'createdBy' })
  creator: Customer

  @OneToMany(() => Message, (msg) => msg.conversation, { cascade: true })
  messages: Message[]

  @OneToMany(() => ConversationParticipant, (participant) => participant.conversation, { cascade: true })
  participants: ConversationParticipant[]
}

