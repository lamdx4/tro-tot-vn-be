import { Request, Response } from 'express'
import { HttpStatus } from '../../utils/data-types/http-status-code'
import axios from 'axios'

export class LocationController {
  /**
   * GET /api/location/wards/:districtId
   * Proxy to Chợ Tốt wards API to avoid CORS
   */
  async getWards(req: Request, res: Response): Promise<void> {
    try {
      const { districtId } = req.params

      if (!districtId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'District ID is required'
        })
        return
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

      // Return the response as-is
      res.status(HttpStatus.OK).json(response.data)
    } catch (error: any) {
      console.error('Error fetching wards:', error.message)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch wards',
        error: error.message
      })
    }
  }
}

