import { Request, Response, NextFunction } from 'express'
import authenticateMiddleware from './authenticate.middleware'

// Re-export as named export
export const authMiddleware = authenticateMiddleware

export * from './authenticate.middleware'
export * from './authority.middlewarer'
export * from './create-post.middleware'
export * from './error.middleware'
export * from './update-post.middleware'
export * from './validateRequest.middleware'

