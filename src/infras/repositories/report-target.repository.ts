import { ReportTarget } from '@/domains/entities/report-tagert.entity'
import { DataSource, Repository } from 'typeorm'

export class ReportTargetRepository extends Repository<ReportTarget> {
  constructor(private datasource: DataSource) {
    super(ReportTarget, datasource.manager)
  }
}