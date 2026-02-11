import { Request, Response } from 'express'
import { MessageService } from '@/services'
import { SendMessageInput, EditMessageInput, MessageQuery } from '@/utils/types/chat.types'

export class MessageController {
  private messageService: MessageService

  constructor() {
    this.messageService = new MessageService()
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
      res.status(200).json({ statusCode: 200, data: messages })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const message = await this.messageService.getMessageById(parseInt(messageId))
      
      if (!message) {
        res.status(404).json({ statusCode: 404, error: { code: 'NOT_FOUND', message: 'Message not found' } })
        return
      }
      
      res.status(200).json({ statusCode: 200, data: message })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const userId = (req as any).user?.customerId || (req as any).user?.userId
      
      if (!userId) {
        res.status(401).json({ statusCode: 401, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } })
        return
      }
      
      const input: SendMessageInput = req.body
      const message = await this.messageService.sendMessage(parseInt(conversationId), userId, input)
      
      res.status(201).json({ statusCode: 201, data: message })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async editMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      const input: EditMessageInput = req.body
      const message = await this.messageService.editMessage(parseInt(messageId), input)
      
      res.status(200).json({ statusCode: 200, data: message })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params
      await this.messageService.deleteMessage(parseInt(messageId))
      res.status(204).send()
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageIds } = req.body
      await this.messageService.markMessagesAsRead(messageIds)
      res.status(200).json({ statusCode: 200, data: { success: true } })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }
}
