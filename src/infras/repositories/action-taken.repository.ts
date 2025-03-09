import { ActionTaken } from '@/domains/entities/action-taken.entity'
import { DataSource, Repository } from 'typeorm'

export class ActionTakenRepository extends Repository<ActionTaken> {
  constructor(private datasource: DataSource) {
    super(ActionTaken, datasource.manager)
  }
}