import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { MultimediaFile } from './multimedia-file.entity'
import { Post } from './post.entity'

@Entity('PostMultimediaFile')
export class PostMultimediaFile {
  @PrimaryColumn({ type: 'int', nullable: false })
  fileId: number

  @PrimaryColumn({ type: 'int', nullable: false })
  postId: number

  @ManyToOne(() => MultimediaFile, (file) => file.postFiles)
  @JoinColumn({ name: 'fileId' })
  file: MultimediaFile

  @ManyToOne(() => Post, (post) => post.multimediaFiles)
  @JoinColumn({ name: 'postId' })
  post: Post
}
