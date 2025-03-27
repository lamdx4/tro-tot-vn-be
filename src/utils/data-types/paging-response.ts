export class PagingRes<T, V> {
  public data: T[]
  public nextCursor: V
  public totalSize: number = 0
  constructor(data: T[], nextCursor: V, totalSize: number = 0) {
    this.data = data
    this.nextCursor = nextCursor
    this.totalSize = totalSize
  }
}

/**
 * Class phân trang dựa trên offset (page number)
 * @template T - Kiểu dữ liệu của items
 */
export class OffsetPaging<T> {
  /** Mảng dữ liệu kết quả */
  public readonly dataPag: T[]

  /** Số trang hiện tại */
  public readonly pageNumber: number

  /** Kích thước trang */
  public readonly pageSize: number

  /** Tổng số items */
  public readonly totalSize: number

  /** Tổng số trang */
  public readonly totalPages: number

  /**
   * Khởi tạo đối tượng phân trang dựa trên offset
   * @param data - Mảng dữ liệu kết quả
   * @param pageNumber - Số trang hiện tại (bắt đầu từ 1)
   * @param pageSize - Kích thước trang
   * @param totalSize - Tổng số items
   */
  constructor(data: T[], pageNumber: number, pageSize: number, totalSize: number) {
    this.dataPag = data
    this.pageNumber = pageNumber
    this.pageSize = pageSize
    this.totalSize = totalSize

    // Tính toán tổng số trang
    this.totalPages = Math.ceil(totalSize / pageSize)
  }

  /**
   * Kiểm tra xem có trang trước hay không
   * @returns true nếu có trang trước
   */
  public hasPreviousPage(): boolean {
    return this.pageNumber > 1
  }

  /**
   * Kiểm tra xem có trang tiếp theo hay không
   * @returns true nếu có trang tiếp theo
   */
  public hasNextPage(): boolean {
    return this.pageNumber < this.totalPages
  }

  /**
   * Tính số trang trước
   * @returns Số trang trước hoặc null nếu không có
   */
  public getPreviousPage(): number | null {
    return this.hasPreviousPage() ? this.pageNumber - 1 : null
  }

  /**
   * Tính số trang tiếp theo
   * @returns Số trang tiếp theo hoặc null nếu không có
   */
  public getNextPage(): number | null {
    return this.hasNextPage() ? this.pageNumber + 1 : null
  }

  /**
   * Tạo response object để trả về cho client
   * @returns Object chứa dữ liệu và thông tin phân trang
   */
  public toResponse(): {
    data: T[]
    pageNumber: number
    pageSize: number
    totalSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number | null
    previousPage: number | null
  } {
    return {
      data: this.dataPag,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      totalSize: this.totalSize,
      totalPages: this.totalPages,
      hasNextPage: this.hasNextPage(),
      hasPreviousPage: this.hasPreviousPage(),
      nextPage: this.getNextPage(),
      previousPage: this.getPreviousPage()
    }
  }
}
/**
 * Class phân trang dựa trên cursor
 * @template T - Kiểu dữ liệu của items
 * @template V - Kiểu dữ liệu của cursor (thường là string hoặc number)
 */
export class CursorPaging<T, V> {
  /** Mảng dữ liệu kết quả */
  public readonly dataPag: T[]

  /** Cursor cho trang tiếp theo, null nếu không còn dữ liệu */
  public readonly nextCursor: V | null

  /**
   * Khởi tạo đối tượng phân trang dựa trên cursor
   * @param data - Mảng dữ liệu kết quả
   * @param nextCursor - Cursor cho trang tiếp theo, null nếu không còn dữ liệu
   */
  constructor(data: T[], nextCursor: V | null) {
    this.dataPag = data
    this.nextCursor = nextCursor
  }

  /**
   * Kiểm tra xem còn dữ liệu để tải tiếp hay không
   * @returns true nếu còn dữ liệu để tải
   */
  public hasMore(): boolean {
    return this.nextCursor !== null
  }

  /**
   * Tạo response object để trả về cho client
   * @returns Object chứa dữ liệu và thông tin phân trang
   */
  public toResponse() {
    return Object.assign(this, { hasMore: this.hasMore() })
  }
}
