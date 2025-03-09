import { InfoEdition } from '@/domains/entities/info-edition.entity'
import { DataSource, Repository } from 'typeorm'

export class InfoEditionRepository extends Repository<InfoEdition> {
  constructor(private datasource: DataSource) {
    super(InfoEdition, datasource.manager)
  }
}