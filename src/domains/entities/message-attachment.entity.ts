import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { Message } from './message.entity'

@Entity('MessageAttachment')
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  attachmentId: number

  @Column({ type: 'int', nullable: false })
  messageId: number

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  fileName: string

  @Column({ type: 'nvarchar', length: 500, nullable: false })
  fileUrl: string

  @Column({ type: 'nvarchar', length: 50, nullable: false })
  fileType: string // 'Image', 'Video', 'File'

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number // Size in bytes

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType?: string // e.g., 'image/jpeg', 'application/pdf'

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  cloudFileId?: string // ID in cloud storage (Google Drive)

  @CreateDateColumn()
  createdAt: Date

  // Relationships
  @ManyToOne(() => Message, (msg) => msg.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message
}

