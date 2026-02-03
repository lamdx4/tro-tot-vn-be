import { Request, Response } from 'express'
import { ChatService } from '@/services'
import { CreateConversationInput, AddParticipantInput } from '@/utils/types/chat.types'

export class ConversationController {
  private chatService: ChatService

  constructor() {
    this.chatService = new ChatService()
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.customerId || (req as any).user?.userId
      if (!userId) {
        res.status(401).json({ statusCode: 401, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } })
        return
      }
      const limit = parseInt(req.query.limit as string) || 20
      const offset = parseInt(req.query.offset as string) || 0
      const conversations = await this.chatService.getConversationsByCustomer(userId, limit, offset)
      res.status(200).json({ statusCode: 200, data: conversations })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const conversation = await this.chatService.getConversationById(parseInt(conversationId))
      if (!conversation) {
        res.status(404).json({ statusCode: 404, error: { code: 'NOT_FOUND', message: 'Conversation not found' } })
        return
      }
      res.status(200).json({ statusCode: 200, data: conversation })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.customerId || (req as any).user?.userId
      const input: CreateConversationInput = req.body
      const conversation = await this.chatService.createConversation(input, userId)
      res.status(201).json({ statusCode: 201, data: conversation })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const input: AddParticipantInput = req.body
      const participant = await this.chatService.addParticipant(parseInt(conversationId), input)
      res.status(201).json({ statusCode: 201, data: participant })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, customerId } = req.params
      await this.chatService.removeParticipant(parseInt(conversationId), parseInt(customerId))
      res.status(204).send()
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }

  async getParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params
      const participants = await this.chatService.getConversationParticipants(parseInt(conversationId))
      res.status(200).json({ statusCode: 200, data: participants })
    } catch (error: any) {
      res.status(500).json({ statusCode: 500, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } })
    }
  }
}
