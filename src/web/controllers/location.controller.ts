import { 
  Get, 
  Route, 
  Tags, 
  Path, 
  Controller,
  Response,
  Request
} from '@tsoa/runtime'
import axios from 'axios'
import { WardResponse } from './dto/location.dto'
import { Response as ExpressResponse } from 'express'

@Route("location")
@Tags("Location")
export class LocationController extends Controller {
  
  constructor() {
    super()
  }

  /**
   * Proxy to Chợ Tốt wards API to avoid CORS.
   * Fetches all wards for a given district ID.
   */
  @Get("wards/{districtId}")
  @Response(500, "Internal Server Error")
  public async getWards(
    @Path() districtId: string,
    @Request() req: any
  ): Promise<any> {
    const res = req.res as ExpressResponse
    try {
      if (!districtId) {
        this.setStatus(400)
        return {
          message: 'District ID is required'
        }
      }

      // Proxy request to Chợ Tốt API
      const response = await axios.get(
        `https://gateway.chotot.com/v2/public/chapy-pro/wards?area=${districtId}`,
        {
          headers: {
            Accept: '*/*'
          }
        }
      )

      this.setStatus(200)
      return response.data
    } catch (error: any) {
      this.setStatus(error.response?.status || 500)
      return {
        message: error.response?.data?.message || 'Failed to fetch wards'
      }
    }
  }
}
