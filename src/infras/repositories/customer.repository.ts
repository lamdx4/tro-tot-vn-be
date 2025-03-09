import { Customer } from '@/domains/entities/customer.entity'
import { BaseRepository } from './base.repository'

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super(Customer)
  }
}