import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Account } from './account.entity'
import { Report } from './report.entity'
import { PenaltyType } from './enum/value-object'

@Entity('AccountPenalty')
@Check(`penaltyType IN ('Temporary Ban', 'Permanent Ban', 'Warning')`)
@Check(`penaltyStart <= ISNULL(penaltyEnd, '9999-12-31')`) // Ensure start date is before end date if it exists
@Check(`(penaltyType = 'Temporary Ban' AND penaltyEnd IS NOT NULL) OR
        (penaltyType != 'Temporary Ban')`)
export class AccountPenalty {
  @PrimaryGeneratedColumn()
  penaltyId: number

  @Column({ type: 'int', nullable: true })
  reportId: number

  @Column({ type: 'int', nullable: false })
  penaltyAccountId: number

  @Column({
    type: "varchar",
    length: 20,
    nullable: false
  })
  penaltyType: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  reason: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  penaltyStart: Date

  @Column({
    type: 'datetime',
    default: null,
    nullable: true
  })
  penaltyEnd: Date

  @ManyToOne(() => Report)
  @JoinColumn({ name: 'reportId' })
  report: Report

  @ManyToOne(() => Account, (account) => account.penalties)
  @JoinColumn({ name: 'penaltyAccountId' })
  penaltyAccount: Account
}
