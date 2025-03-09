import { Participant } from '@/domains/entities/participant.entity'
import { DataSource, Repository } from 'typeorm'

export class ParticipantRepository extends Repository<Participant> {
  constructor(private datasource: DataSource) {
    super(Participant, datasource.manager)
  }
}