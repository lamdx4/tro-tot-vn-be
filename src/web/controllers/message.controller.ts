import { Request, Response } from 'express'
import { MessageService, ChatService } from '@/services'
import { SendMessageInput, EditMessageInput, MessageQuery } from '@/utils/types/chat.types'
import { AttachmentType } from '@/domains/entities/enum/value-object'
import CloudDriveService from '@/services/google-drive.service'
import { SOCKET_EVENTS } from '@/utils/types/socket-events'
import ResponseData from '@/utils/data-types/response'
import path from 'path'

export class MessageController {
  private messageService: MessageService
  private cloudDriveService: CloudDriveService

  constructor() {
    this.messageService = new MessageService()
    this.cloudDriveService = CloudDriveService.gI()
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0

      const query: MessageQuery = {
        conversationId: parseInt(conversationId),
        limit,
        offset
      }

      const messages = await this.messageService.getConversationMessages(query)
      res.status(200).json(ResponseData.success(messages))
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const message = await this.messageService.getMessageById(parseInt(messageId))

      if (!message) {
        res.status(404).json(ResponseData.notFound('Message not found'))
        return
      }

      res.status(200).json(ResponseData.success(message))
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      // JWT token contains nested customer object: req.user.customer.customerId
      const userId = (req as any).user?.customer?.customerId || (req as any).user?.customerId || (req as any).user?.userId

      if (!userId) {
        res.status(401).json(ResponseData.unauthorized('User not authenticated'))
        return
      }

      const input: SendMessageInput = req.body
      const message = await this.messageService.sendMessage(parseInt(conversationId), userId, input)

      // Emit Socket.IO event to conversation room
      const io = (req as any).app?.locals?.io
      if (io) {
        const eventData = {
          messageId: message.messageId,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt
        }
        // Emit to conversation room (exclude sender)
        io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, eventData)
      }

      res.status(201).json(ResponseData.successWithCode(201, message))
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  async editMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const input: EditMessageInput = req.body
      const message = await this.messageService.editMessage(parseInt(messageId), input)

      res.status(200).json(ResponseData.success(message))
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      await this.messageService.deleteMessage(parseInt(messageId))
      res.status(204).send()
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageIds } = req.body
      await this.messageService.markMessagesAsRead(messageIds)
      res.status(200).json(ResponseData.success({ success: true }))
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }

  /**
   * Upload file and send as message
   * POST /conversations/:conversationId/files
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      // JWT token contains nested customer object: req.user.customer.customerId
      const userId = (req as any).user?.customer?.customerId || (req as any).user?.customerId || (req as any).user?.userId

      if (!userId) {
        res.status(401).json(ResponseData.unauthorized('User not authenticated'))
        return
      }

      if (!req.file) {
        res.status(400).json(ResponseData.badRequest('No file uploaded'))
        return
      }

      const file = req.file
      const content = req.body.content || ''

      // Determine file type
      let fileType: string
      const mimeType = file.mimetype
      if (mimeType.startsWith('image/')) {
        fileType = AttachmentType.IMAGE
      } else if (mimeType.startsWith('video/')) {
        fileType = AttachmentType.VIDEO
      } else {
        fileType = AttachmentType.FILE
      }

      // Upload to cloud storage
      const cloudFileId = await this.cloudDriveService.uploadFile(file)

      // Generate public URL (or use cloud storage URL)
      const fileUrl = `/uploads/messages/${path.basename(file.path)}`

      // Create message with attachment
      const message = await this.messageService.sendMessageWithAttachments(
        parseInt(conversationId),
        userId,
        { conversationId: parseInt(conversationId), content, messageType: fileType },
        [{
          fileName: file.originalname,
          fileUrl,
          fileType,
          fileSize: file.size,
          mimeType: file.mimetype,
          cloudFileId: cloudFileId ?? undefined
        }]
      )

      // Emit Socket.IO event to conversation room
      const io = (req as any).app?.locals?.io
      if (io) {
        const eventData = {
          messageId: message.messageId,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments || [],
          createdAt: message.createdAt
        }
        // Emit to conversation room (exclude sender)
        io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.FILE_RECEIVED, eventData)
      }

      res.status(201).json(ResponseData.successWithCode(201, message))
    } catch (error: any) {
      console.error('[MessageController] Error uploading file:', error)
      res.status(500).json(ResponseData.error(500, 'FILE_UPLOAD_ERROR', error.message))
    }
  }

  /**
   * Get file download URL
   * GET /files/:fileId/download
   */
  async getFileDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params

      // Get file info from database
      const attachments = await this.messageService.getMessageAttachments(parseInt(fileId))

      if (!attachments || attachments.length === 0) {
        res.status(404).json(ResponseData.notFound('File not found'))
        return
      }

      const attachment = attachments[0]

      // If we have a cloud file ID, get download URL from cloud storage
      if (attachment.cloudFileId) {
        const downloadUrl = await this.cloudDriveService.getFileUrl(attachment.cloudFileId)
        res.status(200).json(ResponseData.success({
          downloadUrl,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize
        }))
      } else {
        // Local file
        res.status(200).json(ResponseData.success({
          downloadUrl: attachment.fileUrl,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          fileSize: attachment.fileSize
        }))
      }
    } catch (error: any) {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message))
    }
  }
}
