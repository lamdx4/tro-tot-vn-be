import { Participant } from '@/domains/entities/participant.entity'
import { BaseRepository } from './base.repository'

export class ParticipantRepository extends BaseRepository<Participant> {
  constructor() {
    super(Participant)
  }
}