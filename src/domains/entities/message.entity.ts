import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm'
import { MessageType, MessageStatus } from './enum/value-object'
import { Conversation } from './conversation.entity'
import { Customer } from './customer.entity'
import { MessageAttachment } from './message-attachment.entity'

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
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

  // Attachments for file messages
  @OneToMany(() => MessageAttachment, (attachment) => attachment.message, { cascade: true })
  attachments: MessageAttachment[]
}
