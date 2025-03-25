import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'
import { fa } from '@faker-js/faker/.'

@Entity('SubscriptionAreaPost')
@Index(['city', 'customerId', 'district', 'ward'], { unique: true })
export class SubscriptionAreaPost {
  @PrimaryGeneratedColumn()
  subscriptionId: number

  @Column({ type: 'int' })
  customerId: number

  @Column({ type: 'varchar', length: 70, nullable: true })
  ward: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  district: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  city: string

  @Column({ 
    type: "datetime", 
    default: () => "CURRENT_TIMESTAMP" 
  })
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.subscriptions)
  @JoinColumn({ name: 'customerId' })
  customer: Customer
}
