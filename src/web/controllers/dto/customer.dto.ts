export interface CustomerProfileResponse {
  customerId: number
  phone?: string
  email?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  gender?: string
  birthday?: Date
  currentCity?: string
  currentDistrict?: string
  currentJob?: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  gender?: string
  birthday?: string
  currentCity?: string
  currentDistrict?: string
  currentJob?: string
  // avatar handled via @UploadedFile
}

export interface RateRequest {
  numStar: number
  comment: string
}

export interface RateResponse {
  rateId: number
  customerId: number
  postId: number
  numStar: number
  comment: string
  createdAt: Date
}

export interface SavePostRequest {
  postId: number
}

export interface CreateSubscriptionRequest {
  city: string
  district: string
}

export interface SubscriptionResponse {
  subscriptionId: number
  customerId: number
  city: string
  district: string
  createdAt: Date
}
