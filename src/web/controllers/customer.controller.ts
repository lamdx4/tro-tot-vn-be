import { 
  Body, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Route, 
  Security, 
  SuccessResponse, 
  Tags, 
  Request, 
  Query, 
  Path, 
  Controller,
  UploadedFile,
  FormField,
  Response
} from '@tsoa/runtime'
import { CustomerService } from '@/services/customer.service'
import ResponseData from '@/utils/data-types/response'
import { cleanupFiles } from '@/utils/func/delete-file'
import { 
  CustomerProfileResponse, 
  UpdateProfileRequest, 
  RateRequest, 
  RateResponse,
  SavePostRequest,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  CustomerErrorResponse,
  CustomerErrorMessage
} from './dto/customer.dto'
import { CursorPagingResponse } from './dto/post.dto'

@Route("customer")
@Tags("Customer")
export class CustomerController extends Controller {
  private customerService = new CustomerService()

  constructor() {
    super()
  }

  /**
   * Get public profile information for a customer
   */
  @Get("{customerId}/profile")
  @Response<CustomerErrorResponse>(404, "Not Found")
  @Response<CustomerErrorResponse>(500, "Internal Server Error")
  public async getInformation(
    @Path() customerId: number
  ): Promise<ResponseData<CustomerProfileResponse | any>> {
    try {
      const result = await this.customerService.getCustomerProfile(customerId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue() as any)
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get private profile of the current authenticated user
   */
  @Get("me")
  @Security("jwt")
  @Response<CustomerErrorResponse>(401, "Unauthorized")
  @Response<CustomerErrorResponse>(500, "Internal Server Error")
  public async getMyProfile(
    @Request() req: any
  ): Promise<ResponseData<CustomerProfileResponse | null>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.getMyProfile(customerId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Update the current user's profile
   */
  @Post("me")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async updateMyProfile(
    @Request() req: any,
    @UploadedFile() avatar?: Express.Multer.File,
    @FormField() firstName?: string,
    @FormField() lastName?: string,
    @FormField() email?: string,
    @FormField() bio?: string,
    @FormField() gender?: string,
    @FormField() birthday?: string,
    @FormField() currentCity?: string,
    @FormField() currentDistrict?: string,
    @FormField() currentJob?: string
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const dto = { 
        firstName, 
        lastName, 
        email,
        bio,
        gender, 
        birthDate: birthday, 
        currentCity, 
        currentDistrict, 
        currentJob,
        avatarFile: avatar 
      } as any
      const result = await this.customerService.updateMyProfile(customerId, dto)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    } finally {
      cleanupFiles(req)
    }
  }

  /**
   * Get the current user's rating for a specific post
   */
  @Get("posts/{postId}/rate")
  @Security("jwt")
  @Response<CustomerErrorResponse>(401, "Unauthorized")
  @Response<CustomerErrorResponse>(404, "Not Found")
  @Response<CustomerErrorResponse>(500, "Internal Server Error")
  public async getMyRate(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.getMyRateOnPost(customerId, postId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Add or update a rating for a post
   */
  @Post("posts/{postId}/rate")
  @Security("jwt")
  @Response<CustomerErrorResponse>(401, "Unauthorized")
  @Response<CustomerErrorResponse>(404, "Not Found")
  @Response<CustomerErrorResponse>(500, "Internal Server Error")
  public async addRate(
    @Path() postId: number,
    @Body() body: RateRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.addRate(customerId, postId, body.numStar, body.comment ?? '')
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Delete current user's rating on a post
   */
  @Delete("posts/{postId}/rate")
  @Security("jwt")
  @Response<CustomerErrorResponse>(401, "Unauthorized")
  @Response<CustomerErrorResponse>(404, "Not Found")
  @Response<CustomerErrorResponse>(500, "Internal Server Error")
  public async deleteRate(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.delMyRateOnPost(customerId, postId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get all ratings for a specific post (Paginated)
   */
  @Get("posts/{postId}/rates")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getRateFromPost(
    @Path() postId: number,
    @Query() cursor?: string,
    @Query() limit: number = 10
  ): Promise<ResponseData<CursorPagingResponse<RateResponse, string>>> {
    try {
      const cursorDate = cursor ? new Date(cursor) : null
      const result = await this.customerService.getRateFromPost(postId, cursorDate, limit)
      if (result.isSuccess) {
        const data = result.getValue()!
        const nextCursor = data.length > 0 ? data[data.length - 1].createdAt.toISOString() : null
        const hasMore = data.length === limit

        return ResponseData.success({
          dataPag: data as any,
          nextCursor,
          hasMore
        })
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get avg rating and total count for a post
   */
  @Get("posts/{postId}/rate-avg")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getAvgRateFromPost(
    @Path() postId: number
  ): Promise<ResponseData<{ avgRate: number, countRate: number } | any>> {
    try {
      const result = await this.customerService.getAvgRateFromPost(postId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue() as any)
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Save a post to bookmarks
   */
  @Post("saved-posts/{postId}")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async savePost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.savePost(customerId, postId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get all saved posts for current user
   */
  @Get("saved-posts")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getSavedPost(
    @Request() req: any
  ): Promise<ResponseData<any[]>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.getSavedPost(customerId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Delete a saved post
   */
  @Delete("saved-posts/{postId}")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async deleteSavedPost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.deleteSavedPost(customerId, postId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get user's search subscriptions
   */
  @Get("subscriptions")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getSubscription(
    @Request() req: any
  ): Promise<ResponseData<SubscriptionResponse[]>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.getSubscription(customerId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Create a new search subscription
   */
  @Post("subscriptions")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async createSubscription(
    @Body() body: CreateSubscriptionRequest,
    @Request() req: any
  ): Promise<ResponseData<SubscriptionResponse | any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.createSubscription(customerId, body.city, body.district)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue() as any)
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Delete a search subscription
   */
  @Delete("subscriptions/{subscriptionId}")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async deleteSubscription(
    @Path() subscriptionId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.deleteSubscription(customerId, subscriptionId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get history of viewed posts
   */
  @Get("view-history")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getHistoryViewPost(
    @Request() req: any
  ): Promise<ResponseData<any[]>> {
    try {
      const customerId = req.user?.customer?.customerId
      const result = await this.customerService.getViewedPost(customerId)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      }
      this.setStatus(result.code)
      return ResponseData.error(result.code, result.error ?? '', '') as any
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
