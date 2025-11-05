import { SearchLog } from '../../domains/entities/search-log.entity'
import { BaseRepository } from './base.repository'

export class SearchLogRepository extends BaseRepository<SearchLog> {
  constructor() {
    super(SearchLog)
  }

  /**
   * Create a new search log
   */
  async logSearch(data: {
    customerId: number | null
    query: string
    city?: string
    district?: string
    minPrice?: number
    maxPrice?: number
    minAcreage?: number
    maxAcreage?: number
    interiorCondition?: string
    resultCount: number
    searchTimeMs: number
  }): Promise<SearchLog> {
    const log = this.create({
      customerId: data.customerId,
      query: data.query,
      city: data.city || null,
      district: data.district || null,
      minPrice: data.minPrice || null,
      maxPrice: data.maxPrice || null,
      minAcreage: data.minAcreage || null,
      maxAcreage: data.maxAcreage || null,
      interiorCondition: data.interiorCondition || null,
      resultCount: data.resultCount,
      searchTimeMs: data.searchTimeMs
    })

    return this.save(log)
  }

  /**
   * Get popular search queries
   */
  async getPopularQueries(limit: number = 10): Promise<any[]> {
    return this.createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany()
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<any> {
    return this.createQueryBuilder('log')
      .select('COUNT(*)', 'totalSearches')
      .addSelect('AVG(log.resultCount)', 'avgResultCount')
      .addSelect('AVG(log.searchTimeMs)', 'avgSearchTimeMs')
      .getRawOne()
  }
}

