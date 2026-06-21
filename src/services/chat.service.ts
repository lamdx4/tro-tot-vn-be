import { ConversationRepository, ConversationParticipantRepository } from '@/infras/repositories'
import { Conversation } from '@/domains/entities/conversation.entity'
import { ConversationParticipant } from '@/domains/entities/conversation-participant.entity'
import { CreateConversationInput, ConversationDTO, AddParticipantInput, ParticipantDTO } from '@/utils/types/chat.types'

export class ChatService {
  private conversationRepo: ConversationRepository
  private participantRepo: ConversationParticipantRepository

  constructor() {
    this.conversationRepo = new ConversationRepository()
    this.participantRepo = new ConversationParticipantRepository()
  }

  /**
   * Get all conversations for a customer
   */
  async getConversationsByCustomer(customerId: number, search?: string, limit: number = 20, offset: number = 0) {
    const conversations = await this.conversationRepo.findConversationsByUser(
      customerId,
      search,
      limit,
      offset
    )

    return conversations.map(conv => this.toConversationDTO(conv))
  }

  /**
   * Get only conversation IDs for a customer (lightweight)
   */
  async getUserActiveConversationIds(customerId: number): Promise<number[]> {
    return this.conversationRepo.getUserActiveConversationIds(customerId)
  }

  /**
   * Get a conversation by ID
   */
  async getConversationById(conversationId: number): Promise<ConversationDTO | null> {
    const conversation = await this.conversationRepo.findById(conversationId)
    
    if (!conversation) {
      return null
    }

    return this.toConversationDTO(conversation)
  }

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput, createdBy: number): Promise<ConversationDTO> {
    const { conversationType, name } = input
    // Ensure the creator is in the participant list and there are no duplicates
    const participantIds = Array.from(new Set([...input.participantIds, createdBy]))

    // For direct conversations, check if one already exists
    if (conversationType === 'Direct' && participantIds.length === 2) {
      const existing = await this.conversationRepo.findDirectConversation(
        participantIds[0],
        participantIds[1]
      )

      if (existing) {
        return this.toConversationDTO(existing)
      }
    }

    // Create new conversation
    const conversation = await this.conversationRepo.createConversation({
      conversationType,
      groupName: name,
      createdBy
    })

    // Add the creator as a participant
    await this.participantRepo.addParticipant(conversation.conversationId, createdBy)

    // Add all participants from input
    for (const customerId of participantIds) {
      if (customerId !== createdBy) { // Don't add creator twice
        await this.participantRepo.addParticipant(conversation.conversationId, customerId)
      }
    }

    // Fetch the conversation with participants
    const fullConversation = await this.conversationRepo.findById(conversation.conversationId)

    return this.toConversationDTO(fullConversation!)
  }

  /**
   * Add a participant to a conversation
   */
  async addParticipant(
    conversationId: number,
    input: AddParticipantInput
  ): Promise<ParticipantDTO> {
    const { customerId, role = 'Member' } = input

    // Check if participant already exists
    const existing = await this.participantRepo.findByCustomerAndConversation(
      customerId,
      conversationId
    )

    if (existing) {
      throw new Error('Customer is already a participant in this conversation')
    }

    const participant = await this.participantRepo.createParticipant({
      conversationId,
      customerId,
      role
    })

    return this.toParticipantDTO(participant)
  }

  /**
   * Remove a participant from a conversation
   */
  async removeParticipant(conversationId: number, customerId: number): Promise<void> {
    await this.participantRepo.removeParticipant(conversationId, customerId)
  }

  /**
   * Get all participants in a conversation
   */
  async getConversationParticipants(conversationId: number): Promise<ParticipantDTO[]> {
    const participants = await this.participantRepo.getConversationParticipants(conversationId)

    return participants.map(p => this.toParticipantDTO(p))
  }

  /**
   * Check if a customer is a member of a conversation
   */
  async isCustomerInConversation(conversationId: number, customerId: number): Promise<boolean> {
    const participant = await this.participantRepo.findByCustomerAndConversation(
      customerId,
      conversationId
    )

    return !!participant
  }

  /**
   * Convert Conversation entity to DTO
   */
  private toConversationDTO(conversation: Conversation): ConversationDTO {
    const lastMessage = conversation.messages?.[0]
    
    return {
      conversationId: conversation.conversationId,
      conversationType: conversation.conversationType,
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participantCount: conversation.participants?.filter(p => !p.leftAt).length || 0,
      lastMessage: lastMessage?.content,
      lastMessageAt: lastMessage?.createdAt,
      participants: conversation.participants?.map(p => this.toParticipantDTO(p))
    }
  }

  /**
   * Convert ConversationParticipant entity to DTO
   */
  private toParticipantDTO(participant: ConversationParticipant): ParticipantDTO {
    return {
      participantId: participant.participantId,
      conversationId: participant.conversationId,
      customerId: participant.customerId,
      role: participant.role,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      firstName: participant.customer?.firstName,
      lastName: participant.customer?.lastName,
      avatarId: participant.customer?.avatar
    }
  }
}

