import { Report } from '@/domains/entities/report.entity'
import { DataSource, Repository } from 'typeorm'

export class ReportRepository extends Repository<Report> {
  constructor(private datasource: DataSource) {
    super(Report, datasource.manager)
  }
}