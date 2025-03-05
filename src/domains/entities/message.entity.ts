import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./customer.entity"
import { Admin } from "./admin.entity"

@Entity('Message')
export class Message {
  @PrimaryGeneratedColumn()
  messageId: number

  @Column({ type: 'int' })
  sender: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"senderEntityType" IN ('Admin', 'Customer')`)
  senderEntityType: string

  @Column({ type: 'int' })
  receiver: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"receiverEntityType" IN ('Admin', 'Customer')`)
  receiverEntityType: string

  @Column({ type: 'varchar', length: 150 })
  content: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.sentMessages)
  @JoinColumn({ name: 'sender' })
  senderCustomer: Customer

  @ManyToOne(() => Admin, (admin) => admin.sentMessages)
  @JoinColumn({ name: 'sender' })
  senderAdmin: Admin

  @ManyToOne(() => Customer, (customer) => customer.receivedMessages)
  @JoinColumn({ name: 'receiver' })
  receiverCustomer: Customer

  @ManyToOne(() => Admin, (admin) => admin.receivedMessages)
  @JoinColumn({ name: 'receiver' })
  receiverAdmin: Admin
}