import { 
  CreateConversationInput, 
  AddParticipantInput,
  SendMessageInput,
  EditMessageInput,
  MessageQuery
} from '@/utils/types/chat.types'

export interface CreateConversationRequest extends CreateConversationInput {}
export interface AddParticipantRequest extends AddParticipantInput {}
export interface SendMessageRequest extends SendMessageInput {}
export interface EditMessageRequest extends EditMessageInput {}

export interface ChatMessageQuery extends MessageQuery {}

export interface ConversationParticipantParams {
  conversationId: number
  customerId: number
}
