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
  Response,
} from '@tsoa/runtime'
import { ChatService, MessageService } from '@/services'
import ResponseData from '@/utils/data-types/response'
import { CreateConversationRequest, AddParticipantRequest } from './dto/chat.dto'
import { ConversationDTO, ParticipantDTO } from '@/utils/types/chat.types'

@Route("conversations")
@Tags("Chat Conversations")
@Security("jwt")
export class ConversationController extends Controller {
  private chatService = new ChatService()
  private messageService = new MessageService()

  constructor() {
    super()
  }

  /**
   * Sync missed messages since a timestamp across all conversations
   */
  @Get("sync")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async syncMessages(
    @Request() req: any,
    @Query() since: string,
    @Query() limit: number = 100
  ): Promise<ResponseData<import('@/utils/types/chat.types').MessageDTO[]>> {
    try {
      const userId = (req as any).user?.customer?.customerId || (req as any).user?.customerId || (req as any).user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }

      const sinceDate = new Date(since)
      if (isNaN(sinceDate.getTime())) {
        this.setStatus(400)
        return ResponseData.error(400, 'Invalid timestamp format', 'INVALID_TIMESTAMP') as any
      }

      const messages = await this.messageService.getMessagesSince(userId, sinceDate, limit)
      this.setStatus(200)
      return ResponseData.success(messages)
    } catch (error: any) {
      console.error('[ConversationController] Sync error:', error)
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get all conversations for the current user
   */
  @Get()
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getConversations(
    @Request() req: any,
    @Query() limit: number = 20,
    @Query() offset: number = 0
  ): Promise<ResponseData<ConversationDTO[]>> {
    try {
      const userId = (req as any).user?.customer?.customerId || (req as any).user?.customerId || (req as any).user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }
      const conversations = await this.chatService.getConversationsByCustomer(userId, limit, offset)
      this.setStatus(200)
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
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getConversationById(
    @Path() conversationId: number
  ): Promise<ResponseData<ConversationDTO | null>> {
    try {
      const conversation = await this.chatService.getConversationById(conversationId)
      if (!conversation) {
        this.setStatus(404)
        return ResponseData.notFound('Conversation not found') as any
      }
      this.setStatus(200)
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
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async createConversation(
    @Body() body: CreateConversationRequest,
    @Request() req: any
  ): Promise<ResponseData<ConversationDTO>> {
    try {
      const userId = (req as any).user?.customer?.customerId || (req as any).user?.customerId || (req as any).user?.userId
      if (!userId) {
        this.setStatus(401)
        return ResponseData.unauthorized('User not authenticated') as any
      }
      const conversation = await this.chatService.createConversation(body as any, userId)
      this.setStatus(201)
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
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async addParticipant(
    @Path() conversationId: number,
    @Body() body: AddParticipantRequest
  ): Promise<ResponseData<ParticipantDTO>> {
    try {
      const participant = await this.chatService.addParticipant(conversationId, body as any)
      this.setStatus(201)
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
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async removeParticipant(
    @Path() conversationId: number,
    @Path() customerId: number
  ): Promise<void> {
    try {
      await this.chatService.removeParticipant(conversationId, customerId)
      this.setStatus(204)
    } catch (error: any) {
      this.setStatus(500)
      throw error 
    }
  }

  /**
   * Get all participants in a conversation
   */
  @Get("{conversationId}/participants")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getParticipants(
    @Path() conversationId: number
  ): Promise<ResponseData<ParticipantDTO[]>> {
    try {
      const participants = await this.chatService.getConversationParticipants(conversationId)
      this.setStatus(200)
      return ResponseData.success(participants)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
