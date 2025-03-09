import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { BaseRepository } from './base.repository'

export class MultimediaFileRepository extends BaseRepository<MultimediaFile> {
  constructor() {
    super(MultimediaFile)
  }
}