import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Check, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./customer.entity"
import { Post } from "./post.entity"

@Entity('Appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  appointmentId: number

  @Column({ type: 'int' })
  requesterId: number

  @Column({ type: 'int' })
  postId: number

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'datetime' })
  appointment: Date

  @Column({ type: 'varchar', length: 20 })
  @Check(`"status" IN ('Pending', 'Reject', 'Accept')`)
  status: string

  @ManyToOne(() => Customer, (customer) => customer.appointments)
  @JoinColumn({ name: 'requesterId' })
  requester: Customer

  @ManyToOne(() => Post, (post) => post.appointments)
  @JoinColumn({ name: 'postId' })
  post: Post
}
