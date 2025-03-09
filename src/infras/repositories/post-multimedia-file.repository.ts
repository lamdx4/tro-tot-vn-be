import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'
import { BaseRepository } from './base.repository'

export class PostMultimediaFileRepository extends BaseRepository<PostMultimediaFile> {
  constructor() {
    super(PostMultimediaFile)
  }
}