import ResponseData from '@/utils/data-types/response'
import { Request, Response, NextFunction } from 'express'

export const requirePermissionMiddleware = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(new ResponseData(401, 'Unauthorized', []))
    }
    const permissions = req.user.role.rolePermissions.map((p) => p.permission.permissionName)
    if (!permissions.includes(permission)) {
      res.status(403).json(new ResponseData(403, 'Forbidden', []))
      return
    }
    next()
  }
}
export const requireRoleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json(new ResponseData(401, 'Unauthorized', []))
      return
    }
    if (!roles.includes(req.user.role.roleName)) {
      res.status(403).json(new ResponseData(403, 'Forbidden', []))
      return
    }
    next()
  }
}
