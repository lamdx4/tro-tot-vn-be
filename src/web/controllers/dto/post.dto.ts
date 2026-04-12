export interface HidePostRequest {
  postId: number
}

export interface PostSearchQuery {
  keyword?: string
  city?: string
  district?: string
  ward?: string
  acreage?: string // format: min-max
  price?: string // format: min-max
  interiorCondition?: string
  limit?: number
  cursor?: string
}

export interface PostResponse {
  postId: number
  ownerId: number
  status: string
  createdAt: Date
  title: string
  description: string
  price: number
  streetNumber: string
  street: string
  ward: string
  district: string
  city: string
  interiorCondition: string
  acreage: number
  multimediaFiles?: any[]
}

export interface CursorPagingResponse<T, V = any> {
  dataPag: T[]
  nextCursor: V | null
  hasMore: boolean
}
