// WebSocket event interface
export interface SocketEvent<T = any> {
  type: string
  timestamp: Date
  data?: T
  error?: string
}

// Event name constants
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Message events
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETED: 'message:deleted',

  // File upload events
  FILE_UPLOAD: 'file:upload',
  FILE_UPLOADED: 'file:uploaded',
  FILE_SENT: 'file:sent',
  FILE_RECEIVED: 'file:received',

  // Read receipt events
  MESSAGE_READ: 'message:read',
  MESSAGES_READ: 'messages:read',

  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Online status
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // Participant events
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left'
} as const

// Typed event payloads
export interface MessageSentEvent {
  messageId: number
  conversationId: number
  senderId: number
  content: string
  messageType: string
  createdAt: Date
}

export interface MessageReadEvent {
  messageId: number
  conversationId: number
  readBy: number
  readAt: Date
}

export interface TypingEvent {
  conversationId: number
  userId: number
  isTyping: boolean
}

export interface FileUploadEvent {
  conversationId: number
  fileName: string
  fileSize: number
  mimeType: string
  fileType: string // 'Image', 'Video', 'File'
}

export interface FileSentEvent {
  messageId: number
  conversationId: number
  senderId: number
  content: string
  messageType: string
  attachments: {
    attachmentId: number
    fileName: string
    fileUrl: string
    fileType: string
    fileSize?: number
    mimeType?: string
  }[]
  createdAt: Date
}

export interface UserStatusEvent {
  userId: number
  isOnline: boolean
  timestamp: Date
}

