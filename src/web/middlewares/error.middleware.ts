import { Request, Response, NextFunction } from 'express'
import ResponseData from '@/utils/data-types/response'

/**
 * Global error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging
  console.error('Error:', err.message)
  
  // TSOA Validation Error
  if (err.name === 'ValidateError' || (err.status === 400 && err.fields)) {
    const status = 400
    const fields = err.fields
    
    // Map TSOA error fields to match legacy express-validator format
    const errorDetails = Object.keys(fields).map(key => {
      // Clean prefix (body., query., params.) to match legacy keys
      const cleanKey = key.replace(/^(body|query|params)\./, '')
      return {
        msg: fields[key].message,
        param: cleanKey,
        location: key.split('.')[0] || 'body',
        value: fields[key].value
      }
    })
    
    res.status(status).json(new ResponseData(status, 'VALIDATION_ERROR', errorDetails, null))
    return
  }

  // Handle other specific errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    res.status(401).json(new ResponseData(401, 'UNAUTHORIZED', [{ msg: err.message || 'Authentication error' }], null))
    return
  }

  if (err.status === 404 || err.name === 'NotFoundError') {
    res.status(404).json(new ResponseData(404, 'NOT_FOUND', [{ msg: err.message || 'Resource not found' }], null))
    return
  }

  // Default error code
  const statusCode = err.status || (res.statusCode !== 200 ? res.statusCode : 500)

  // Generic error response
  res.status(statusCode).json(new ResponseData(statusCode, err.code || 'INTERNAL_ERROR', [{ msg: err.message || 'Server error' }], null))
}

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json(new ResponseData(404, 'NOT_FOUND', [{ msg: `Path ${req.originalUrl} not found` }], null))
}
