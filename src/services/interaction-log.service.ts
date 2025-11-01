import { UserInteractionLogRepository } from '../infras/repositories/user-interaction-log.repository'

export default class InteractionLogService {
  private static instance: InteractionLogService
  private repository: UserInteractionLogRepository

  private constructor() {
    this.repository = new UserInteractionLogRepository()
  }

  public static gI(): InteractionLogService {
    return this.instance || (this.instance = new this())
  }

  /**
   * Log any interaction (view/save/contact)
   */
  async logInteraction(
    customerId: number,
    postId: number,
    typeAction: 1 | 2 | 3
  ): Promise<void> {
    try {
      await this.repository.save({
        customerId,
        postId,
        typeAction,
        createdAt: new Date()
      })
      console.log(`[Interaction Log] Logged ${typeAction} for customer ${customerId}, post ${postId}`)
    } catch (error) {
      console.error('[Interaction Log] Failed to log interaction:', error)
      // Don't throw - interaction logging shouldn't break main flow
    }
  }

  /**
   * Log view interaction (typeAction = 1)
   */
  async logView(customerId: number, postId: number): Promise<void> {
    return this.logInteraction(customerId, postId, 1)
  }

  /**
   * Log save interaction (typeAction = 2)
   */
  async logSave(customerId: number, postId: number): Promise<void> {
    return this.logInteraction(customerId, postId, 2)
  }

  /**
   * Log contact interaction (typeAction = 3)
   */
  async logContact(customerId: number, postId: number): Promise<void> {
    return this.logInteraction(customerId, postId, 3)
  }
}

