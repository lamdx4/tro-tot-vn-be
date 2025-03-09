import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { DataSource, Repository } from 'typeorm'

export class MultimediaFileRepository extends Repository<MultimediaFile> {
  constructor(private datasource: DataSource) {
    super(MultimediaFile, datasource.manager)
  }
}