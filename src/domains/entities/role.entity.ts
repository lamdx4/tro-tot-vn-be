import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Account } from "./account.entity"
import { RolePermission } from "./role-permission.entity"

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn()
  roleId: number

  @Column({ type: 'varchar', length: 20 })
  roleName: string

  @OneToMany(() => Account, (account) => account.role)
  accounts: Account[]

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[]
}