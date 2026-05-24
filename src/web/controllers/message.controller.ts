import {
  Body,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
  Query,
  Path,
  Controller,
  UploadedFile,
  FormField,
  Response,
} from '@tsoa/runtime'
import { MessageService, ChatService, NotificationService } from '@/services'
import { MultimediaFileRepository } from '@/infras/repositories'
import CloudDriveService from '@/services/google-drive.service'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { SendMessageInput, EditMessageInput } from '@/utils/types/chat.types'
import { AttachmentType } from '@/domains/entities/enum/value-object'
import { SOCKET_EVENTS } from '@/utils/types/socket-events'
import ResponseData from '@/utils/data-types/response'
import path from 'path'
import { MessageDTO } from '@/utils/types/chat.types'
import { FileValidator } from '@/utils/validators/file.validator'
import { cleanupFiles } from '@/utils/func/delete-file'

@Route("chat")
@Tags("Chat Messages")
@Security("jwt")
export class MessageController extends Controller {
  private messageService = new MessageService()
  private chatService = new ChatService()
  private notificationService = NotificationService.gI()
  private multimediaRepo = new MultimediaFileRepository()
  private cloudDriveService = CloudDriveService.gI()

  constructor() {
    super()
  }

  /**
   * Get messages for a conversation
   */
  @Get("conversations/{conversationId}/messages")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getMessages(
    @Path() conversationId: number,
    @Query() limit: number = 20,
    @Query() offset: number = 0
  ): Promise<ResponseData<MessageDTO[]>> {
    try {
      const messages = await this.messageService.getConversationMessages({
        conversationId,
        limit,
        offset
      })
      return ResponseData.success(messages)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get a single message by ID
   */
  @Get("messages/{messageId}")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getMessageById(
    @Path() messageId: number
  ): Promise<ResponseData<MessageDTO>> {
    try {
      const message = await this.messageService.getMessageById(messageId)
      if (!message) {
        this.setStatus(404)
        return ResponseData.notFound('Message not found') as any
      }
      return ResponseData.success(message)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Send a new message
   */
  @Post("conversations/{conversationId}/messages")
  @SuccessResponse("201", "Created")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async sendMessage(
    @Path() conversationId: number,
    @Body() body: SendMessageInput,
    @Request() req: any
  ): Promise<ResponseData<MessageDTO>> {
    try {
      const userId = req.user?.customer?.customerId || req.user?.customerId || req.user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }

      const message = await this.messageService.sendMessage(conversationId, userId, body)

      // Emit Socket.IO event to conversation room
      const io = req.app?.locals?.io
      const eventData = {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt
      }
      if (io) {
        io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, eventData)
      }

      // Send Push Notifications (via FCM for offline devices)
      const customer = req.user?.customer
      const senderName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Người dùng'
      
      this.chatService.getConversationParticipants(conversationId).then(participants => {
        participants.forEach(participant => {
          if (participant.customerId !== Number(userId)) {
            console.log(`[MessageController] HTTP message received. Dispatching FCM to participant: customerId=${participant.customerId}, senderName="${senderName}"`)
            this.notificationService.notifyChatMessage(participant.customerId, {
              ...eventData,
              senderName
            }).catch(err => console.error(`[MessageController] Failed to send FCM for user ${participant.customerId}:`, err))
          }
        })
      }).catch(err => console.error('[MessageController] Failed to get participants for FCM:', err))

      return ResponseData.successWithCode(201, message)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Edit a message
   */
  @Put("messages/{messageId}")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async editMessage(
    @Path() messageId: number,
    @Body() body: EditMessageInput
  ): Promise<ResponseData<MessageDTO>> {
    try {
      const message = await this.messageService.editMessage(messageId, body)
      return ResponseData.success(message)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Delete a message
   */
  @Delete("messages/{messageId}")
  @SuccessResponse("204", "No Content")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async deleteMessage(
    @Path() messageId: number
  ): Promise<void> {
    try {
      await this.messageService.deleteMessage(messageId)
      this.setStatus(204)
    } catch (error: any) {
      this.setStatus(500)
      throw error
    }
  }

  /**
   * Mark messages as read
   */
  @Post("messages/read")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async markRead(
    @Body() body: { messageIds: number[] }
  ): Promise<ResponseData<{ success: boolean }>> {
    try {
      await this.messageService.markMessagesAsRead(body.messageIds)
      return ResponseData.success({ success: true })
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Upload file and send as message
   */
  @Post("conversations/{conversationId}/files")
  @SuccessResponse("201", "Created")
  @Response<ResponseData<any>>(400, "Bad Request")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "File Upload Error")
  public async uploadFile(
    @Path() conversationId: number,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @FormField() content?: string
  ): Promise<ResponseData<MessageDTO>> {
    try {
      const userId = req.user?.customer?.customerId || req.user?.customerId || req.user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }

      if (!file) {
        this.setStatus(400)
        return ResponseData.error(400, 'BAD_REQUEST', 'No file uploaded') as any
      }

      const fileError = FileValidator.validateMessageFile(file);
      if (fileError) {
        this.setStatus(400);
        return ResponseData.error(400, fileError, '') as any;
      }

      const finalContent = content || ''

      // Determine file type
      let fileType: string = AttachmentType.FILE
      const mimeType = file.mimetype
      if (mimeType.startsWith('image/')) {
        fileType = AttachmentType.IMAGE
      } else if (mimeType.startsWith('video/')) {
        fileType = AttachmentType.VIDEO
      }


      // Upload to cloud storage
      const cloudFileId = await this.cloudDriveService.uploadFile(file)
      if (!cloudFileId) {
        throw new Error('Failed to upload file to cloud')
      }

      // Create MultimediaFile record
      const multimedia = new MultimediaFile()
      multimedia.fileCloudId = cloudFileId
      multimedia.fileType = fileType.startsWith('Image') ? 'Image' : 'Video'
      const savedMultimedia = await this.multimediaRepo.save(multimedia)

      const fileUrl = `/api/files/${savedMultimedia.fileId}`

      // 3. Send message with attachment
      const message = await this.messageService.sendMessageWithAttachments(
        conversationId,
        userId,
        { conversationId, content: finalContent, messageType: fileType as any },
        [{
          fileName: file.originalname,
          fileUrl,
          fileType: fileType as any,
          fileSize: file.size,
          mimeType: file.mimetype,
          cloudFileId: cloudFileId,
          fileId: savedMultimedia.fileId
        }]
      )

      // Emit Socket.IO event to conversation room
      const io = req.app?.locals?.io
      const eventData = {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        attachments: message.attachments || [],
        createdAt: message.createdAt
      }
      if (io) {
        io.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.FILE_RECEIVED, eventData)
      }

      // Send Push Notifications (via FCM for offline devices)
      const customer = req.user?.customer
      const senderName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Người dùng'
      
      this.chatService.getConversationParticipants(conversationId).then(participants => {
        participants.forEach(participant => {
          if (participant.customerId !== Number(userId)) {
            console.log(`[MessageController] HTTP file message uploaded. Dispatching FCM to participant: customerId=${participant.customerId}, senderName="${senderName}"`)
            this.notificationService.notifyChatMessage(participant.customerId, {
              ...eventData,
              senderName
            }).catch(err => console.error(`[MessageController] Failed to send FCM for user ${participant.customerId}:`, err))
          }
        })
      }).catch(err => console.error('[MessageController] Failed to get participants for FCM:', err))

      return ResponseData.successWithCode(201, message)
    } catch (error: any) {
      console.error('[MessageController] Error uploading file:', error)
      this.setStatus(500)
      return ResponseData.error(500, 'FILE_UPLOAD_ERROR', error.message) as any
    } finally {
      cleanupFiles(req)
    }
  }

  /**
   * Get file download URL
   */
  @Get("files/{fileId}/download")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getFileDownloadUrl(
    @Path() fileId: number
  ): Promise<ResponseData<{ downloadUrl: string, fileName: string, mimeType: string, fileSize: number }>> {
    try {
      const attachments = await this.messageService.getMessageAttachments(fileId)
      if (!attachments || attachments.length === 0) {
        this.setStatus(404)
        return ResponseData.notFound('File not found') as any
      }

      const attachment = attachments[0]
      let downloadUrl = attachment.fileUrl

      if (attachment.cloudFileId) {
        downloadUrl = (await this.cloudDriveService.getFileUrl(attachment.cloudFileId)) || attachment.fileUrl
      }

      return ResponseData.success({
        downloadUrl,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType || '',
        fileSize: attachment.fileSize || 0
      })
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}