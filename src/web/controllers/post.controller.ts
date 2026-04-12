import {
  Body,
  Get,
  Post,
  Put,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
  Query,
  Path,
  Controller,
  UploadedFiles,
  UploadedFile,
  FormField
} from '@tsoa/runtime'
import PostService from '@/services/post.service'
import ResponseData from '@/utils/data-types/response'
import { deleteFileFromDisk, deleteFileFromDisk2 } from '@/utils/func/delete-file'
import { CursorPaging } from '@/utils/data-types/paging-response'
import { 
  HidePostRequest,
  PostResponse,
  CursorPagingResponse
} from './dto/post.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
// Removed invalid import

@Route("posts")
@Tags("Posts")
export class PostController extends Controller {
  private postService = new PostService()

  constructor() {
    super()
  }

  /**
   * Create a new property post
   * Requires images and optionally a video
   */
  @Post()
  @Security("jwt")
  @SuccessResponse("200", "Post created successfully")
  public async createPost(
    @FormField() title: string,
    @FormField() description: string,
    @FormField() price: string,
    @FormField() acreage: string,
    @FormField() streetNumber: string,
    @FormField() street: string,
    @FormField() ward: string,
    @FormField() district: string,
    @FormField() city: string,
    @FormField() interiorStatus: string,
    @UploadedFiles() images: Express.Multer.File[],
    @UploadedFile() video: Express.Multer.File,
    @Request() req: any
  ): Promise<ResponseData<PostResponse | string | null>> {
    try {
      const body: CreatePostDto = {
        title,
        price,
        acreage,
        interiorStatus,
        city,
        ward,
        district,
        streetNumber,
        street,
        description
      }
      
      const result = await this.postService.createPost(
        req.user?.customer!, 
        body as any, 
        images, 
        video
      )

      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    } finally {
      deleteFileFromDisk(req.files as any)
    }
  }

  /**
   * Edit an existing property post
   */
  @Put("{postId}")
  @Security("jwt")
  @SuccessResponse("200", "Post updated successfully")
  public async editPost(
    @Path() postId: number,
    @FormField() title: string,
    @FormField() description: string,
    @FormField() price: string,
    @FormField() acreage: string,
    @FormField() streetNumber: string,
    @FormField() street: string,
    @FormField() ward: string,
    @FormField() district: string,
    @FormField() city: string,
    @FormField() interiorStatus: string,
    @FormField() oldFiles: any,
    @UploadedFiles() images: Express.Multer.File[],
    @UploadedFile() video: Express.Multer.File,
    @Request() req: any
  ): Promise<ResponseData<PostResponse | string | null>> {
    try {
      const dto: UpdatePostDto = {
        title,
        price,
        acreage,
        interiorStatus,
        city,
        ward,
        district,
        streetNumber,
        street,
        description,
        oldFiles: typeof oldFiles === 'string' && oldFiles.startsWith('[') ? JSON.parse(oldFiles) : oldFiles
      }

      const result = await this.postService.editPost(
        req.user?.customer!.customerId!,
        postId,
        dto,
        images || [],
        video
      )

      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    } finally {
      deleteFileFromDisk2(req.files as any)
    }
  }

  /**
   * Get posts belong to current user
   */
  @Get("my-posts")
  @Security("jwt")
  public async getMyPosts(
    @Query() status: string = 'Approved',
    @Query() cursor: number = 0,
    @Query() limit: number = 10,
    @Request() req: any
  ): Promise<ResponseData<CursorPagingResponse<PostResponse, number>>> {
    try {
      const result = await this.postService.getPosts(
        req.user?.customer!,
        status || '',
        cursor || 0,
        limit
      )

      if (result.isSuccess) {
        const posts = result.getValue()!
        const nextCursor = posts.length > 0 ? posts[posts.length - 1].postId : null
        return ResponseData.success(
          new CursorPaging(posts, nextCursor).toResponse()
        )
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get post detail by ID (Public)
   */
  @Get("{postId}")
  public async getPostDetail(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<PostResponse | null>> {
    try {
      const authHeader = req.headers['authorization']
      const authorizationToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
      const result = await this.postService.getPostDetail(postId, authorizationToken)
      
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get own post detail (Authorized)
   */
  @Get("my-posts/{postId}")
  @Security("jwt")
  public async getDetailMyPost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer!.customerId!
      const result = await this.postService.getDetailMyPost(postId, customerId)
      
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get latest posts (Home page)
   */
  @Get("latest")
  public async getLastPost(
    @Query() limit: number = 4
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.postService.getLastPost(limit)
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Hide a post
   */
  @Post("hide")
  @Security("jwt")
  public async hideMyPost(
    @Body() body: HidePostRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer.customerId
      const result = await this.postService.hidePost(body.postId, customerId)
      
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Unhide a post
   */
  @Post("unhide")
  @Security("jwt")
  public async unHideMyPost(
    @Body() body: HidePostRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer.customerId
      const result = await this.postService.unHidePost(body.postId, customerId)
      
      if (result.isSuccess) {
        return ResponseData.success(result.getValue())
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Search posts with filters
   */
  @Get("search")
  public async searchPost(
    @Query() keyword: string = '',
    @Query() city?: string,
    @Query() district?: string,
    @Query() ward?: string,
    @Query() interiorCondition?: string,
    @Query() acreage?: string,
    @Query() price?: string,
    @Query() cursor?: string,
    @Query() limit: number = 10
  ): Promise<ResponseData<CursorPagingResponse<PostResponse, any>>> {
    try {
      const acreageArr = acreage ? acreage.split('-').map(v => Number(v)) : undefined
      const priceArr = price ? price.split('-').map(v => Number(v)) : undefined
      const cursorDate = cursor && !isNaN(Date.parse(cursor)) ? new Date(cursor) : undefined

      const result = await this.postService.searchPost(
        keyword,
        city,
        district,
        ward,
        interiorCondition,
        acreageArr,
        priceArr,
        cursorDate,
        limit
      )

      if (result.isSuccess) {
        const posts = result.getValue()!
        const nextCursor = posts.length > 0 ? posts[posts.length - 1].extendedAt : null
        return ResponseData.success(
          new CursorPaging(posts, nextCursor).toResponse()
        )
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
