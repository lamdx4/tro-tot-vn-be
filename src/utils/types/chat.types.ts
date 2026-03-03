// DTOs for Conversation
export interface ConversationDTO {
  conversationId: number
  conversationType: string
  createdBy: number
  createdAt: Date
  updatedAt?: Date
  participantCount?: number
  lastMessage?: string
  lastMessageAt?: Date
}

export interface CreateConversationInput {
  conversationType: string  // 'Direct' | 'Group'
  participantIds: number[]   // [customerId1, customerId2, ...]
  name?: string              // For group conversations
}

// DTOs for Message
export interface MessageDTO {
  messageId: number
  conversationId: number
  senderId: number
  content: string
  messageType: string
  status: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
  attachments?: AttachmentDTO[]
}

export interface SendMessageInput {
  conversationId: number
  content: string
  messageType?: string  // default: 'Text'
}

export interface EditMessageInput {
  content: string
}

// DTOs for Participant
export interface ParticipantDTO {
  participantId: number
  conversationId: number
  customerId: number
  role: string
  joinedAt: Date
  leftAt?: Date | null
}

export interface AddParticipantInput {
  customerId: number
  role?: string  // default: 'Member'
}

// Response wrapper
export interface ChatResponse<T> {
  statusCode: number
  data?: T
  error?: {
    code: string
    message: string
  }
}

// Pagination
export interface MessageQuery {
  conversationId: number
  limit?: number  // default: 20
  offset?: number // default: 0
  before?: number // message ID for cursor pagination
}

// DTOs for Message Attachment
export interface AttachmentDTO {
  attachmentId: number
  messageId: number
  fileName: string
  fileUrl: string
  fileType: string // 'Image', 'Video', 'File'
  fileSize?: number
  mimeType?: string
  cloudFileId?: string
  createdAt: Date
}

export interface SendMessageWithAttachmentsInput {
  conversationId: number
  content: string
  messageType?: string  // default: 'Text'
  attachments: Omit<AttachmentDTO, 'attachmentId' | 'messageId' | 'createdAt'>[]
}

