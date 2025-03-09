import { Appointment } from '@/domains/entities/appointment.entity'
import { BaseRepository } from './base.repository'

export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor() {
    super(Appointment)
  }
}