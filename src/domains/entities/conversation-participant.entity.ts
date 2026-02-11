import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { ParticipantRole } from './enum/value-object'
import { Conversation } from './conversation.entity'
import { Customer } from './customer.entity'

@Entity('ConversationParticipant')
@Index(['conversationId', 'customerId'], { unique: true })
@Index(['customerId', 'joinedAt'])
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  participantId: number

  @Column({ type: 'int', nullable: false })
  conversationId: number

  @Column({ type: 'int', nullable: false })
  customerId: number

  @Column({ type: 'nvarchar', length: 20, default: ParticipantRole.MEMBER })
  role: string

  @CreateDateColumn()
  joinedAt: Date

  @Column({ type: 'datetime', nullable: true })
  leftAt?: Date

  // Relationships
  @ManyToOne(() => Conversation, (conv) => conv.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer
}

