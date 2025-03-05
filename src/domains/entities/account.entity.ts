import { Entity, Column, Check, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { AccountPenalty } from "./account-penalty.entity"
import { Customer } from "./customer.entity"
import { Role } from "./role.entity"
import { Admin } from "./admin.entity"

@Entity('Account')
export class Account {
  @PrimaryGeneratedColumn()
  accountId: number

  @Column({ type: 'char', length: 12, unique: true })
  phone: string

  @Column({ type: 'varchar', length: 60 })
  password: string

  @Column({ type: 'int' })
  roleId: number

  @Column({ type: 'nvarchar', length: 255, default: 'Active' })
  @Check(`"status" IN ('InActive', 'Active', 'Banned')`)
  status: string

  @Column({ type: 'varchar', length: 60, unique: true })
  email: string

  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn({ name: 'roleId' })
  role: Role

  @OneToMany(() => Admin, (admin) => admin.account)
  admins: Admin[]

  @OneToMany(() => Customer, (customer) => customer.account)
  customers: Customer[]

  @OneToMany(() => AccountPenalty, (penalty) => penalty.penaltyAccount)
  penalties: AccountPenalty[]
}

