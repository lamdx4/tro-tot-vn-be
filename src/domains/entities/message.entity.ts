import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm'
import { MessageType, MessageStatus } from './enum/value-object'
import { Conversation } from './conversation.entity'
import { Customer } from './customer.entity'

@Entity('Message')
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number

  @Column({ type: 'int', nullable: false })
  conversationId: number

  @Column({ type: 'int', nullable: false })
  senderId: number

  @Column({ type: 'nvarchar', length: 4000 })
  content: string

  @Column({ type: 'nvarchar', length: 20, default: MessageType.TEXT })
  messageType: string

  @Column({ type: 'nvarchar', length: 20, default: MessageStatus.SENT })
  status: string

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

  @Column({ type: 'datetime', nullable: true })
  deletedAt?: Date

  // Relationships
  @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'senderId' })
  sender: Customer
}
