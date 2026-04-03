import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'

@Entity('DeviceToken')
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int', nullable: false })
  @Index()
  customerId: number

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  fcmToken: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  platform: string // 'ios', 'android', 'web'

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  lastUsedAt: Date

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer
}
