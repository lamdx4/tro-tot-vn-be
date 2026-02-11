import { Router } from 'express'
import { ConversationController } from '@/web/controllers/chat.controller'
import { MessageController } from '@/web/controllers/message.controller'
import authenticateMiddleware from '@/web/middlewares/authenticate.middleware'

const router = Router()
const conversationController = new ConversationController()
const messageController = new MessageController()

// Apply authentication middleware to all routes
router.use(authenticateMiddleware)

// Conversation routes
router.get('/conversations', conversationController.getConversations.bind(conversationController))
router.get('/conversations/:conversationId', conversationController.getConversationById.bind(conversationController))
router.post('/conversations', conversationController.createConversation.bind(conversationController))
router.post('/conversations/:conversationId/participants', conversationController.addParticipant.bind(conversationController))
router.delete('/conversations/:conversationId/participants/:customerId', conversationController.removeParticipant.bind(conversationController))
router.get('/conversations/:conversationId/participants', conversationController.getParticipants.bind(conversationController))

// Message routes
router.get('/conversations/:conversationId/messages', messageController.getMessages.bind(messageController))
router.get('/messages/:messageId', messageController.getMessageById.bind(messageController))
router.post('/conversations/:conversationId/messages', messageController.sendMessage.bind(messageController))
router.put('/messages/:messageId', messageController.editMessage.bind(messageController))
router.delete('/messages/:messageId', messageController.deleteMessage.bind(messageController))
router.post('/messages/read', messageController.markMessagesAsRead.bind(messageController))

export default router

