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
} from '@tsoa/runtime'
import { ChatService } from '@/services'
import ResponseData from '@/utils/data-types/response'
import { CreateConversationRequest, AddParticipantRequest } from './dto/chat.dto'
import { ConversationDTO, ParticipantDTO } from '@/utils/types/chat.types'

@Route("conversations")
@Tags("Chat Conversations")
@Security("jwt")
export class ConversationController extends Controller {
  private chatService = new ChatService()

  constructor() {
    super()
  }

  /**
   * Get all conversations for the current user
   */
  @Get()
  public async getConversations(
    @Request() req: any,
    @Query() limit: number = 20,
    @Query() offset: number = 0
  ): Promise<ResponseData<ConversationDTO[]>> {
    try {
      const userId = req.user?.customer?.customerId || req.user?.customerId || req.user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }
      const conversations = await this.chatService.getConversationsByCustomer(userId, limit, offset)
      return ResponseData.success(conversations)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get conversation details by ID
   */
  @Get("{conversationId}")
  public async getConversationById(
    @Path() conversationId: number
  ): Promise<ResponseData<ConversationDTO | null>> {
    try {
      const conversation = await this.chatService.getConversationById(conversationId)
      if (!conversation) {
        this.setStatus(404)
        return ResponseData.notFound('Conversation not found') as any
      }
      return ResponseData.success(conversation)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Create a new conversation (Direct or Group)
   */
  @Post()
  @SuccessResponse("201", "Conversation created successfully")
  public async createConversation(
    @Body() body: CreateConversationRequest,
    @Request() req: any
  ): Promise<ResponseData<ConversationDTO>> {
    try {
      const userId = req.user?.customer?.customerId || req.user?.customerId || req.user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }
      const conversation = await this.chatService.createConversation(body, userId)
      return ResponseData.successWithCode(201, conversation)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Add a participant to a group conversation
   */
  @Post("{conversationId}/participants")
  @SuccessResponse("201", "Participant added successfully")
  public async addParticipant(
    @Path() conversationId: number,
    @Body() body: AddParticipantRequest
  ): Promise<ResponseData<ParticipantDTO>> {
    try {
      const participant = await this.chatService.addParticipant(conversationId, body)
      return ResponseData.successWithCode(201, participant)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Remove a participant from a group conversation
   */
  @Delete("{conversationId}/participants/{customerId}")
  @SuccessResponse("204", "Participant removed successfully")
  public async removeParticipant(
    @Path() conversationId: number,
    @Path() customerId: number
  ): Promise<void> {
    try {
      await this.chatService.removeParticipant(conversationId, customerId)
      this.setStatus(204)
    } catch (error: any) {
      this.setStatus(500)
      throw error // Let global error handler handle it, or return ResponseData if preferred
    }
  }

  /**
   * Get all participants in a conversation
   */
  @Get("{conversationId}/participants")
  public async getParticipants(
    @Path() conversationId: number
  ): Promise<ResponseData<ParticipantDTO[]>> {
    try {
      const participants = await this.chatService.getConversationParticipants(conversationId)
      return ResponseData.success(participants)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
