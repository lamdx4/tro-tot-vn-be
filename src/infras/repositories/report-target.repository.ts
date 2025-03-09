import { ReportTarget } from '@/domains/entities/report-tagert.entity'
import { BaseRepository } from './base.repository'

export class ReportTargetRepository extends BaseRepository<ReportTarget> {
  constructor() {
    super(ReportTarget)
  }
}