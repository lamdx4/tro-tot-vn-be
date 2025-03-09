import { InfoEdition } from '@/domains/entities/info-edition.entity'
import { BaseRepository } from './base.repository'

export class InfoEditionRepository extends BaseRepository<InfoEdition> {
  constructor() {
    super(InfoEdition)
  }
}