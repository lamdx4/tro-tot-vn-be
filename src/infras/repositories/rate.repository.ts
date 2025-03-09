import { Rate } from '@/domains/entities/rate.entity'
import { BaseRepository } from './base.repository'

export class RateRepository extends BaseRepository<Rate> {
  constructor() {
    super(Rate)
  }
}