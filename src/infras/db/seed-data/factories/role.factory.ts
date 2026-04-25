import { Role } from '@/domains/entities/role.entity'
import { Permission } from '@/domains/entities/permission.entity'
import { RolePermission } from '@/domains/entities/role-permission.entity'
import AppDataSource from '@/infras/db/datasource'

export class RoleFactory {
  /**
   * Standard roles for the application
   */
  static readonly ROLES = [
    { roleName: 'Customer' },     // Regular users looking for/posting rental properties
    { roleName: 'Moderator' },    // Can moderate content but limited admin access
    { roleName: 'Manager' },      // Can manage most aspects except system settings
  ]

  /**
   * Real-world permissions organized by functional area
   */
  static readonly PERMISSIONS = [
    // Post management
    { permissionName: 'post.create' },
    { permissionName: 'post.update.own' },
    { permissionName: 'post.update.any' },
    { permissionName: 'post.delete.own' },
    { permissionName: 'post.delete.any' },
    { permissionName: 'post.approve' },
    { permissionName: 'post.reject' },
    { permissionName: 'post.feature' },
    
    // User management
    { permissionName: 'user.create' },
    { permissionName: 'user.update.own' },
    { permissionName: 'user.update.any' },
    { permissionName: 'user.delete.own' },
    { permissionName: 'user.delete.any' },
    { permissionName: 'user.ban' },
    { permissionName: 'user.unban' },
    
    // Report management
    { permissionName: 'report.create' },
    { permissionName: 'report.read' },
    { permissionName: 'report.resolve' },
    { permissionName: 'report.delete' },
    
    // Message system
    { permissionName: 'message.send' },
    { permissionName: 'message.read.own' },
    { permissionName: 'message.read.any' }, // For admins to read any conversation
    { permissionName: 'message.delete.own' },
    { permissionName: 'message.delete.any' },
    
    // Rating system
    { permissionName: 'rating.create' },
    { permissionName: 'rating.update.own' },
    { permissionName: 'rating.delete.own' },
    { permissionName: 'rating.delete.any' },
    
    // Appointment system
    { permissionName: 'appointment.create' },
    { permissionName: 'appointment.read.own' },
    { permissionName: 'appointment.read.any' },
    { permissionName: 'appointment.update.own' },
    { permissionName: 'appointment.update.any' },
    { permissionName: 'appointment.delete.own' },
    { permissionName: 'appointment.delete.any' },
    
    // File/Media management
    { permissionName: 'media.upload' },
    { permissionName: 'media.delete.own' },
    { permissionName: 'media.delete.any' },
    
    // System settings
    { permissionName: 'system.settings.read' },
    { permissionName: 'system.settings.update' },
    { permissionName: 'system.logs.read' }
  ]

  /**
   * Role-permission mappings defining what each role can do
   */
  static readonly ROLE_PERMISSION_MAP = {
    // Customer permissions
    'Customer': [
      'post.create', 'post.update.own', 'post.delete.own',
      'user.read', 'user.update.own', 'user.delete.own',
      'report.create', 'report.read',
      'message.send', 'message.read.own', 'message.delete.own',
      'rating.create', 'rating.update.own', 'rating.delete.own',
      'appointment.create', 'appointment.read.own', 'appointment.update.own', 'appointment.delete.own',
      'media.upload', 'media.read', 'media.delete.own'
    ],
    
    // Moderator permissions
    'Moderator': [
      'post.create', 'post.update.own', 'post.delete.own', 'post.update.any', 
      'post.approve', 'post.reject',
      'user.read', 'user.update.own',
      'report.read', 'report.resolve',
      'message.send', 'message.read.own', 'message.delete.own',
      'rating.create', 'rating.read', 'rating.update.own', 'rating.delete.own', 'rating.delete.any',
      'appointment.create', 'appointment.read.own', 'appointment.read.any', 'appointment.update.own',
      'media.upload', 'media.read', 'media.delete.own', 'media.delete.any',
      'system.logs.read'
    ],
    
    // Manager permissions
    'Manager': [
      'post.create', 'post.update.own', 'post.update.any', 'post.delete.own', 
      'post.delete.any', 'post.approve', 'post.reject', 'post.feature',
      'user.create', 'user.read', 'user.update.own', 'user.update.any', 'user.ban', 'user.unban',
      'report.create', 'report.read', 'report.resolve', 'report.delete',
      'message.send', 'message.read.own', 'message.read.any', 'message.delete.own', 'message.delete.any',
      'rating.create', 'rating.read', 'rating.update.own', 'rating.delete.own', 'rating.delete.any',
      'appointment.create', 'appointment.read.own', 'appointment.read.any', 
      'appointment.update.own', 'appointment.update.any', 'appointment.delete.own', 'appointment.delete.any',
      'media.upload', 'media.read', 'media.delete.own', 'media.delete.any',
      'system.settings.read', 'system.logs.read'
    ],
    
    // Administrator permissions - everything
  }

  /**
   * Seeds role, permission, and role-permission data
   */
  static async seedRolesAndPermissions(): Promise<void> {
    const roleRepository = AppDataSource.getRepository(Role)
    const permissionRepository = AppDataSource.getRepository(Permission)
    const rolePermissionRepository = AppDataSource.getRepository(RolePermission)
    
    console.log('[Seed] Seeding roles and permissions...')
    
    // Check if data already exists
    const roleCount = await roleRepository.count()
    if (roleCount > 0) {
      console.log('[Seed] Roles and permissions already seeded')
      return
    }
    
    // 1. Create roles
    const roleEntities: Role[] = []
    for (const roleData of this.ROLES) {
      const role = new Role()
      role.roleName = roleData.roleName
      const savedRole = await roleRepository.save(role)
      roleEntities.push(savedRole)
    }
    console.log(`Created ${roleEntities.length} roles`)
    
    // 2. Create permissions
    const permissionEntities: Permission[] = []
    const permissionMap = new Map<string, Permission>()
    
    for (const permData of this.PERMISSIONS) {
      const permission = new Permission()
      permission.permissionName = permData.permissionName
      const savedPermission = await permissionRepository.save(permission)
      permissionEntities.push(savedPermission)
      permissionMap.set(savedPermission.permissionName, savedPermission)
    }
    console.log(`Created ${permissionEntities.length} permissions`)
    
    // 3. Create role-permission relationships
    let rolePermissionCount = 0
    
    for (const [roleName, permissionNames] of Object.entries(this.ROLE_PERMISSION_MAP)) {
      const role = roleEntities.find(r => r.roleName === roleName)
      if (!role) continue
      
      for (const permName of permissionNames) {
        const permission = permissionMap.get(permName)
        if (!permission) continue
        
        const rolePermission = new RolePermission()
        rolePermission.roleId = role.roleId
        rolePermission.permissionId = permission.permissionId
        
        await rolePermissionRepository.save(rolePermission)
        rolePermissionCount++
      }
    }
    
    console.log(`Created ${rolePermissionCount} role-permission assignments`)
  }
}