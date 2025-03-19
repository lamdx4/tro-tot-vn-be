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