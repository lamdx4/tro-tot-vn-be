import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./customer.entity"

@Entity('SubscriptionAreaPost')
export class SubscriptionAreaPost {
  @PrimaryGeneratedColumn()
  subscriptionId: number


  @Column({ type: 'int' })
  customerId: number

  @Column({ type: 'varchar', length: 70, nullable: true })
  ward: string

  @Column({ type: 'varchar', length: 70 })
  district: string

  @Column({ type: 'varchar', length: 70 })
  city: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.subscriptionAreas)
  @JoinColumn({ name: 'customerId' })
  customer: Customer
}