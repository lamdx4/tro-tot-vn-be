import ExampleService from '@/services/example.service'
import { Request, Response, NextFunction } from 'express'

class ExampleController {
  private exampleService = new ExampleService()
  /**
   * Get all examples
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examples = await this.exampleService.getAllCustomers()
      res.status(200).json(examples)
    } catch (e) {
      next(e)
    }
  }
}

// Create and export controller instance
export default new ExampleController()
