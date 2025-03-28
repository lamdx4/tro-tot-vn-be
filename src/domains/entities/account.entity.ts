import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany, Check } from 'typeorm'
import { Customer } from './customer.entity'
import { Role } from './role.entity'
import { Admin } from './admin.entity'
import { AccountStatus } from './enum/value-object'

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
    default: AccountStatus.ACTIVE,
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

}
