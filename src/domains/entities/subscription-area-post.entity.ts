import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'
import { fa } from '@faker-js/faker/.'

@Entity('SubscriptionAreaPost')
@Index(['city', 'customerId', 'district'], { unique: true })
export class SubscriptionAreaPost {
  @PrimaryGeneratedColumn()
  subscriptionId: number

  @Column({ type: 'int' })
  customerId: number

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  district: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  city: string

  @Column({
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.subscriptions)
  @JoinColumn({ name: 'customerId' })
  customer: Customer
}
