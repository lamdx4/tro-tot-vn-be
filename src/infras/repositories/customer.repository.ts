import { Customer } from '@/domains/entities/customer.entity'
import { DataSource, Repository } from 'typeorm'

export class CustomerRepository extends Repository<Customer> {
  constructor(private datasource: DataSource) {
    super(Customer, datasource.manager)
  }
}