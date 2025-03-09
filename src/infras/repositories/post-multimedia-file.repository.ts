import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'
import { DataSource, Repository } from 'typeorm'

export class PostMultimediaFileRepository extends Repository<PostMultimediaFile> {
  constructor(private datasource: DataSource) {
    super(PostMultimediaFile, datasource.manager)
  }
}