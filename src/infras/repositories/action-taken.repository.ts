import { ActionTaken } from '@/domains/entities/action-taken.entity'
import { BaseRepository } from './base.repository'

export class ActionTakenRepository extends BaseRepository<ActionTaken> {
  constructor() {
    super(ActionTaken)
  }
}