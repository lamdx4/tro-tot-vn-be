import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Check, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Customer } from './customer.entity'
import { Post } from './post.entity'
import { AppointmentStatus } from './enum/value-object'

@Entity('Appointment')
@Check(`status IN ('Pending', 'Reject', 'Accept')`)
@Index(['postId', 'requesterId', 'appointmentAt'], { unique: true })
@Check(`appointmentAt > createdAt`) // Ensure appointment time is in the future relative to creation time
export class Appointment {
  @PrimaryGeneratedColumn()
  appointmentId: number

  @Column({ type: 'int', nullable: false })
  requesterId: number

  @Column({ type: 'int', nullable: false })
  postId: number

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  status: string

  @Column({ type: 'datetime', nullable: false })
  appointmentAt: Date

  @ManyToOne(() => Customer, (customer) => customer.appointments)
  @JoinColumn({ name: 'requesterId' })
  requester: Customer

  @ManyToOne(() => Post, (post) => post.appointments)
  @JoinColumn({ name: 'postId' })
  post: Post
}
