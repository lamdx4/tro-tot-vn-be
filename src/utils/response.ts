export default class ResponseData<T> {
  status: number
  message: string
  error: any[]
  data: T | null

  constructor(status: number, message: string = '', error: any[] = [], data: T | null = null) {
    this.status = status
    this.message = message
    this.error = error
    this.data = data
  }

  static success<T>(data: T): ResponseData<T> {
    return new ResponseData(200, '', [], data)
  }
  static failure<T>(status: number, message: string, error: string) {
    return new ResponseData(status, message, [error], null)
  }
  static error<T>(status: number, message: string, error: string) {
    return new ResponseData(status, message, [error], null)
  }
  static notFound<T>(message: string) {
    return new ResponseData(404, message, [], null)
  }
  static unauthorized<T>(message: string) {
    return new ResponseData(401, message, [], null)
  }
  static badRequest<T>(message: string) {
    return new ResponseData(400, message, [], null)
  }
}
