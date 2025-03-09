import { Report } from '@/domains/entities/report.entity'
import { BaseRepository } from './base.repository'

export class ReportRepository extends BaseRepository<Report> {
  constructor() {
    super(Report)
  }
}