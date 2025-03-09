import { Request, Response, NextFunction } from 'express'
import ResponseData from '@/utils/response'

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging
  console.error('Error:', err.message)
  console.error('Stack:', err.stack)

  // Default error code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  // Check for specific error types (can be expanded)
  if (err.name === 'ValidationError') {
    res.status(400).json(new ResponseData(400, [], [err.message], null))
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json(new ResponseData(401, [], ['Authentication error'], null))
  }

  // Generic error response
  res.status(statusCode).json(new ResponseData(statusCode, [], [err.message || 'Server error'], null))
}

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json(new ResponseData(404, [], [`Path ${req.originalUrl} not found`], null))
}
