// Result.ts
export class Result<T> {
  public readonly code: number
  public readonly isSuccess: boolean
  public readonly error: string | null
  private readonly _value: T | null

  private constructor(code: number, isSuccess: boolean, error?: string | null, value?: T | null) {
    this.code = code
    if (isSuccess && error) {
      throw new Error('InvalidOperation: Một Result không thể thành công mà lại có error')
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: Result thất bại cần có thông báo error')
    }
    this.isSuccess = isSuccess
    this.error = error ? error : null
    this._value = value !== undefined ? value : null
    Object.freeze(this)
  }

  public getValue(): T {
    if (!this.isSuccess || this._value === null) {
      throw new Error('Không thể lấy giá trị từ Result thất bại')
    }
    return this._value
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(200, true, null, value === undefined ? null : value)
  }

  public static fail(code: number, message: string): Result<null> {
    return new Result<null>(code, false, message)
  }
}
