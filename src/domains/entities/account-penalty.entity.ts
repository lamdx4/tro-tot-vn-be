import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Account } from "./account.entity"
import { Report } from "./report.entity"

@Entity('AccountPenalty')
export class AccountPenalty {
  @PrimaryGeneratedColumn()
  penaltyId: number

  @Column({ type : 'int', nullable: true })
  reportId: number

  @Column({ type: 'int' })
  penaltyAccountId: number

  @Column({ type: 'varchar', length: 20 })
  @Check(`"penaltyType" IN ('Temporary Ban', 'Permanent Ban', 'Warning')`)
  penaltyType: string

  @Column({ type: 'varchar', length: 100 })
  reason: string

  @CreateDateColumn()
  penaltyStart: Date

  @Column({type : 'datetime', nullable: true })
  penaltyEnd: Date

  @ManyToOne(() => Report, (report) => report.penalties)
  @JoinColumn({ name: 'reportId' })
  report: Report

  @ManyToOne(() => Account, (account) => account.penalties)
  @JoinColumn({ name: 'penaltyAccountId' })
  penaltyAccount: Account
}
