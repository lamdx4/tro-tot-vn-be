import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm'
import { AccountPenalty } from './account-penalty.entity'
import { ActionTaken } from './action-taken.entity'
import { Customer } from './customer.entity'
import { Admin } from './admin.entity'
import { ReportTarget } from './report-tagert.entity'
import { ReportStatus } from './enum/value-object'

@Entity('Report')
@Check(`status IN ('Pending', 'Done')`)
@Check(`(status = 'Done' AND handlerId IS NOT NULL AND resolutionMessage IS NOT NULL) OR 
        (status = 'Pending')`) // If report is done, handler and resolution must be provided
export class Report {
  @PrimaryGeneratedColumn()
  reportId: number

  @Column({ type: 'int', nullable: false })
  senderId: number

  @Column({ type: 'int', nullable: false })
  targetId: number

  @Column({
    type: "varchar",
    length: 20,
    nullable: false
  })
  status: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  detail: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false
  })
  createdAt: Date

  @Column({ type: 'int', nullable: true })
  handlerId: number

  @Column({ type: 'int', nullable: false })
  actionTaken: number

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  resolutionMessage: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false
  })
  resolvedAt: Date

  @ManyToOne(() => Customer, (customer) => customer.sentReports)
  @JoinColumn({ name: 'senderId' })
  sender: Customer

  @ManyToOne(() => ReportTarget, (target) => target.reports)
  @JoinColumn({ name: 'targetId' })
  target: ReportTarget

  @ManyToOne(() => Admin, (admin) => admin.handledReports)
  @JoinColumn({ name: 'handlerId' })
  handler: Admin

  @ManyToOne(() => ActionTaken, (action) => action.reports)
  @JoinColumn({ name: 'actionTaken' })
  action: ActionTaken
}
