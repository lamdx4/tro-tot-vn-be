import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { RolePermission } from "./role-permission.entity"

@Entity('Permission')
export class Permission {
  @PrimaryGeneratedColumn()
  permissionId: number

  @Column({ type: 'varchar', length: 40 })
  permissionName: string

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[]
}