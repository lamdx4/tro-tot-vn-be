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
  FormField,
  Response
} from '@tsoa/runtime'
import PostService from '@/services/post.service'
import ResponseData from '@/utils/data-types/response'
import { cleanupFiles } from '@/utils/func/delete-file'
import { CursorPaging } from '@/utils/data-types/paging-response'
import { 
  HidePostRequest,
  PostResponse,
  CursorPagingResponse,
  PostErrorResponse,
  PostErrorMessage
} from './dto/post.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'
import { FileValidator } from '@/utils/validators/file.validator'

@Route("posts")
@Tags("Posts")
export class PostController extends Controller {
  private postService = new PostService()

  constructor() {
    super()
  }

  /**
   * Create a new property post
   */
  @Post()
  @Security("jwt")
  @SuccessResponse("200", "Post created successfully")
  @Response<PostErrorResponse>(401, "Unauthorized")
  @Response<PostErrorResponse>(500, "Internal Server Error")
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
  ): Promise<ResponseData<any>> {
    const imagesError = FileValidator.validateImages(images);
    if (imagesError) {
      this.setStatus(400);
      return ResponseData.error(400, imagesError, '') as any;
    }
    const videoError = FileValidator.validateVideo(video);
    if (videoError) {
      this.setStatus(400);
      return ResponseData.error(400, videoError, '') as any;
    }

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
        this.setStatus(200)
        return new ResponseData(200, 'Upload successfully')
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    } finally {
      cleanupFiles(req)
    }
  }

  /**
   * Edit an existing property post
   */
  @Put("{postId}")
  @Security("jwt")
  @SuccessResponse("200", "Post updated successfully")
  @Response<PostErrorResponse>(401, "Unauthorized")
  @Response<PostErrorResponse>(404, "Not Found")
  @Response<PostErrorResponse>(500, "Internal Server Error")
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
  ): Promise<ResponseData<any>> {
    const imagesError = FileValidator.validateImages(images);
    if (imagesError) {
      this.setStatus(400);
      return ResponseData.error(400, imagesError, '') as any;
    }
    const videoError = FileValidator.validateVideo(video);
    if (videoError) {
      this.setStatus(400);
      return ResponseData.error(400, videoError, '') as any;
    }

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
        dto as any,
        images || [],
        video
      )

      if (result.isSuccess) {
        this.setStatus(200)
        return new ResponseData(200, 'Upload successfully')
      } else {
        this.setStatus(result.code)
        return new ResponseData(result.code, result.error ?? '')
      }
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    } finally {
      cleanupFiles(req)
    }
  }

  /**
   * Get posts belong to current user
   */
  @Get("me")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getMyPosts(
    @Query() status: string = 'Approved',
    @Query() cursor: number = 0,
    @Query() limit: number = 10,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.postService.getPosts(
        req.user?.customer!,
        status || '',
        isNaN(Number(cursor)) ? 0 : Number(cursor),
        Number(limit)
      )

      if (result.isSuccess) {
        const posts = result.getValue()!
        const nextCursor = posts.length > 0 ? posts[posts.length - 1].postId : null
        this.setStatus(200)
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
   * Search posts with filters
   */
  @Get("search")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async searchPost(
    @Query() keyword: string = '',
    @Query() city?: string,
    @Query() district?: string,
    @Query() ward?: string,
    @Query() interiorCondition?: string,
    /** @pattern ^\d+-\d+$ */
    @Query() acreage?: string,
    /** @pattern ^\d+-\d+$ */
    @Query() price?: string,
    @Query() cursor?: string,
    /** @min 1 @max 100 */
    @Query() limit: number = 10
  ): Promise<ResponseData<any>> {
    try {
      const acreageArr = acreage ? String(acreage).split('-').map(v => Number(v)) : undefined
      const priceArr = price ? String(price).split('-').map(v => Number(v)) : undefined
      const rLimit = Number(limit) || 4
      const rCursor = cursor && !isNaN(Date.parse(cursor)) ? new Date(cursor) : undefined

      const result = await this.postService.searchPost(
        keyword,
        city,
        district,
        ward,
        interiorCondition,
        acreageArr,
        priceArr,
        rCursor,
        rLimit
      )

      if (result.isSuccess) {
        const posts = result.getValue()!
        const nextCursor = posts.length > 0 ? posts[posts.length - 1].extendedAt : null
        this.setStatus(200)
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
   * Get latest posts (Home page)
   */
  @Get("latest")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getLastPost(
    @Query() limit: number = 4
  ): Promise<ResponseData<any>> {
    try {
      const rLimit = Number(limit) || 4
      const result = await this.postService.getLastPost(rLimit)
      if (result.isSuccess) {
        this.setStatus(200)
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
  @Post("{postId}/hide")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async hideMyPost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer.customerId
      const result = await this.postService.hidePost(postId, customerId)
      
      if (result.isSuccess) {
        this.setStatus(200)
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
  @Post("{postId}/unhide")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async unHideMyPost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer.customerId
      const result = await this.postService.unHidePost(postId, customerId)
      
      if (result.isSuccess) {
        this.setStatus(200)
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
   * Get post detail by ID (Public)
   */
  @Get("{postId}")
  @Response<PostErrorResponse>(404, "Not Found")
  @Response<PostErrorResponse>(500, "Internal Server Error")
  public async getPostDetail(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<PostResponse | null>> {
    try {
      const result = await this.postService.getPostDetail(postId, req.headers['authorization'])
      
      if (result.isSuccess) {
        this.setStatus(200)
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
  @Get("me/{postId}")
  @Security("jwt")
  @Response<ResponseData<any>>(401, "Unauthorized")
  @Response<ResponseData<any>>(404, "Not Found")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getDetailMyPost(
    @Path() postId: number,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer!.customerId!
      const result = await this.postService.getDetailMyPost(postId, customerId)
      
      if (result.isSuccess) {
        this.setStatus(200)
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

}
