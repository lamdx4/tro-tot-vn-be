import { 
  Get, 
  Route, 
  Tags, 
  Path, 
  Controller
} from '@tsoa/runtime'
import axios from 'axios'
import { WardResponse } from './dto/location.dto'

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
  public async getWards(
    @Path() districtId: string
  ): Promise<WardResponse[]> {
    try {
      // Proxy request to Chợ Tốt API
      const response = await axios.get(
        `https://gateway.chotot.com/v2/public/chapy-pro/wards?area=${districtId}`,
        {
          headers: {
            Accept: '*/*'
          }
        }
      )

      return response.data
    } catch (error: any) {
      this.setStatus(500)
      console.error('Error fetching wards:', error.message)
      throw new Error('Failed to fetch wards')
    }
  }
}
