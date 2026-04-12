export interface DashboardStatsResponse {
  totalPendingPost: number
  totalRejectedPostInWeek: number
  totalApprovedPostInWeek: number
}

export interface ModeratePostRequest {
  actionType: "Approved" | "Rejected"
  reason?: string
  isHateContent?: boolean
}

export interface ModeratorProfileResponse {
  adminId: number
  firstName: string
  lastName: string
  birthday: Date
  gender: string
  joinedAt: Date
  account: {
    email: string
    phone: string
    status: string
  }
}

export interface ModeratorSummary {
  adminId: number
  firstName: string
  lastName: string
  birthday: Date
  gender: string
  joinedAt: Date
  account: {
    email: string
    phone: string
    status: string
  }
}

export interface PostModerationHistoryResponse {
  postId: number
  actionType: string
  reason?: string
  execAt: Date
  admin: {
    accountId: number
    firstName: string
    lastName: string
    account: {
      email: string
    }
  }
}

export interface ModeratorActionHistoryResponse {
  postId: number
  actionType: string
  reason?: string
  execAt: Date
  post: {
    postId: number
    title: string
  }
}

export interface AddModeratorRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  birthday: string
}

export interface UpdateModeratorStatusRequest {
  status: string
}

export interface ModerationStatsResponse {
  aiRejections: number
  adminRejections: number
  totalProcessed: number
  [key: string]: any
}
