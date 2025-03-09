import { Appointment } from '@/domains/entities/appointment.entity'
import { DataSource, Repository } from 'typeorm'

export class AppointmentRepository extends Repository<Appointment> {
  constructor(private datasource: DataSource) {
    super(Appointment, datasource.manager)
  }
}