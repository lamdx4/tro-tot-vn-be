import { Gender } from '@/domains/entities/enum/value-object'

export default interface UpdateCustomerProfile {
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: Date
}
