import { Message } from '@/domains/entities/message.entity'
import { DataSource, Repository } from 'typeorm'

export class MessageRepository extends Repository<Message> {
  constructor(private datasource: DataSource) {
    super(Message, datasource.manager)
  }
}