import { Request, Response, NextFunction } from 'express'
import ResponseData from '@/utils/response'

class ExampleController {
  /**
   * Get all examples
   */
  getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const examples = [
        { id: 1, name: 'Example 1' },
        { id: 2, name: 'Example 2' }
      ]
      
      res.json(new ResponseData(200, ['Examples retrieved'], [], examples))
    } catch (error) {
      next(error)
    }
  }
  
  /**
   * Get example by ID
   */
  getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id)
      const example = { id, name: `Example ${id}` }
      
      res.json(new ResponseData(200, ['Example retrieved'], [], example))
    } catch (error) {
      next(error)
    }
  }
  
  /**
   * Create a new example
   */
  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const newExample = { id: 3, ...req.body }
      
      res.status(201).json(new ResponseData(201, ['Example created'], [], newExample))
    } catch (error) {
      next(error)
    }
  }
}

// Create and export controller instance
export default new ExampleController()