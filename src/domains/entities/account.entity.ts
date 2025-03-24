import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany, Check } from 'typeorm'
import { AccountPenalty } from './account-penalty.entity'
import { Customer } from './customer.entity'
import { AccountStatus } from './enum/value-object'
import { Role } from './role.entity'
import { Admin } from './admin.entity'

@Entity('Account')
@Check(`status IN ('Active', 'InActive', 'Banned')`)
export class Account {
  @PrimaryGeneratedColumn()
  accountId: number

  @Column({ type: 'varchar', length: 12, unique: true, nullable: false })
  phone: string

  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string

  @Column({ type: 'int', nullable: false })
  roleId: number

  @Column({
    type: "varchar",
    length: 20,
    default: "Active",
    nullable: false
  })
  status: string;

  @Column({ type: 'varchar', length: 60, unique: true, nullable: false })
  email: string

  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn({ name: 'roleId' })
  role: Role

  @OneToOne(() => Admin, (admin) => admin.account)
  admin: Admin

  @OneToOne(() => Customer, (customer) => customer.account)
  customer: Customer

  @OneToMany(() => AccountPenalty, (penalty) => penalty.penaltyAccount)
  penalties: AccountPenalty[]
}
