import { 
  Body, 
  Get, 
  Put, 
  Post, 
  Route, 
  Security, 
  Tags, 
  Query, 
  Path, 
  Controller,
  Request,
  Response
} from '@tsoa/runtime'
import AdminService from '@/services/admin.service'
import { 
  DashboardStatsResponse, 
  ModeratePostRequest, 
  ModeratorProfileResponse, 
  ModeratorActionHistoryResponse, 
  PostModerationHistoryResponse, 
  AddModeratorRequest, 
  UpdateModeratorStatusRequest, 
  ModerationStatsResponse,
  ModeratorSummary,
  AdminErrorResponse
} from './dto/admin.dto'
import ResponseData from '@/utils/data-types/response'

@Route("admin")
@Tags("Admin")
export class AdminController extends Controller {
  private adminService = new AdminService()

  constructor() {
    super()
  }

  /**
   * Get overall dashboard statistics.
   */
  @Get("dashboard-stats")
  @Security("jwt", ["Admin", "Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async getStatisticsForDashBoard(): Promise<ResponseData<DashboardStatsResponse>> {
    const result = await this.adminService.getStatisticsForDashBoard()
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Reset moderator password.
   */
  @Put("moderators/{moderatorId}/reset-password")
  @Security("jwt", ["Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async resetPasswordOfModerator(
    @Path() moderatorId: number
  ): Promise<ResponseData<string | any>> {
    const result = await this.adminService.resetPasswordOfModerator(moderatorId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * List all pending posts for review.
   */
  @Get("posts/pending")
  @Security("jwt", ["Admin", "Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async listPostPending(): Promise<ResponseData<any[]>> {
    const result = await this.adminService.listPostPending()
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Moderate a post (Approve or Reject).
   */
  @Post("posts/{postId}/moderate")
  @Security("jwt", ["Admin", "Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async moderatePost(
    @Path() postId: number,
    @Body() body: ModeratePostRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    // Legacy validation: Reason required if Rejected
    if (body.actionType === 'Rejected' && (!body.reason || body.reason.trim() === '')) {
      this.setStatus(400)
      return ResponseData.error(400, 'REJECTION_REASON_REQUIRED', 'Rejection reason is required') as any
    }

    const reviewerId = req.user?.admin?.adminId
    const result = await this.adminService.moderatePost(
      reviewerId,
      body.actionType,
      postId,
      body.reason || '',
      body.isHateContent
    )
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() || 'Moderated successfully')
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Get moderation history for a specific post.
   */
  @Get("posts/{postId}/history")
  @Security("jwt", ["Admin", "Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async getHistoryOfPost(
    @Path() postId: number
  ): Promise<ResponseData<PostModerationHistoryResponse[]>> {
    const result = await this.adminService.getHistoryOfPost(postId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Get moderation history for a specific moderator.
   */
  @Get("moderators/{moderatorId}/history")
  @Security("jwt", ["Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async getHistoryByModeratorId(
    @Path() moderatorId: number
  ): Promise<ResponseData<ModeratorActionHistoryResponse[]>> {
    const result = await this.adminService.getHistoryByModeratorId(moderatorId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * List all moderators (excluding managers).
   */
  @Get("moderators")
  @Security("jwt", ["Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getModerators(
    @Query() key?: string
  ): Promise<ResponseData<ModeratorSummary[]>> {
    const result = await this.adminService.getModeratorsService(key || null)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Create a new moderator account.
   */
  @Post("moderators")
  @Security("jwt", ["Manager"])
  @Response<ResponseData<any>>(400, "Bad Request")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async addModerators(
    @Body() body: AddModeratorRequest
  ): Promise<ResponseData<string | any>> {
    const result = await this.adminService.addModeratorsService(
      body.firstName,
      body.lastName,
      body.email,
      body.phone,
      body.gender,
      new Date(body.birthday)
    )
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Update moderator account status.
   */
  @Put("moderators/{moderatorId}/status")
  @Security("jwt", ["Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async updateModerator(
    @Path() moderatorId: number,
    @Body() body: UpdateModeratorStatusRequest
  ): Promise<ResponseData<string | any>> {
    const result = await this.adminService.updateModeratorService(body.status, moderatorId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Get detailed profile of a moderator.
   */
  @Get("moderators/{moderatorId}/profile")
  @Security("jwt", ["Manager"])
  @Response<AdminErrorResponse>(401, "Unauthorized")
  @Response<AdminErrorResponse>(404, "Not Found")
  @Response<AdminErrorResponse>(500, "Internal Server Error")
  public async getProfileModerator(
    @Path() moderatorId: number
  ): Promise<ResponseData<ModeratorProfileResponse>> {
    const result = await this.adminService.getProfileModeratorService(moderatorId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Get current moderator's own profile.
   */
  @Get("me/profile")
  @Security("jwt", ["Admin", "Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getMyProfile(
    @Request() req: any
  ): Promise<ResponseData<any>> {
    const adminId = req.user?.admin?.adminId
    const result = await this.adminService.getMyProfileService(adminId)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Update current moderator's own profile.
   */
  @Put("me/profile")
  @Security("jwt", ["Admin", "Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async updateMyProfile(
    @Request() req: any,
    @Body() body: any
  ): Promise<ResponseData<string | any>> {
    const accountId = req.user?.accountId
    const result = await this.adminService.updateMyProfileService(
      accountId,
      body.phone,
      body.email,
      body.gender,
      body.birthday,
      body.firstName,
      body.lastName
    )
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Get moderation performance statistics.
   */
  @Get("moderation-stats")
  @Security("jwt", ["Admin", "Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getModerationStats(): Promise<ResponseData<ModerationStatsResponse>> {
    const result = await this.adminService.getModerationStats()
    if (result.isSuccess) {
      return ResponseData.success(result.getValue() as any)
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }

  /**
   * Export training data for AI retraining.
   */
  @Get("export-training-data")
  @Security("jwt", ["Admin", "Manager"])
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async exportTrainingData(
    @Query() limit?: number
  ): Promise<ResponseData<any>> {
    const result = await this.adminService.exportTrainingData(limit)
    if (result.isSuccess) {
      return ResponseData.success(result.getValue())
    }
    this.setStatus(result.code)
    return ResponseData.error(result.code, result.error ?? '', '') as any
  }
}
