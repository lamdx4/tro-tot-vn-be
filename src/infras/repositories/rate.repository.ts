import { Rate } from '@/domains/entities/rate.entity'
import { DataSource, Repository } from 'typeorm'

export class RateRepository extends Repository<Rate> {
  constructor(private datasource: DataSource) {
    super(Rate, datasource.manager)
  }
}