import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm"
import { Permission } from "./permission.entity"
import { Role } from "./role.entity"

@Entity('RolePermission')
export class RolePermission {
  
  @PrimaryColumn({ type: 'int' })
  permissionId: number

  @PrimaryColumn({ type: 'int' })
  roleId: number

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: 'roleId' })
  role: Role
}
