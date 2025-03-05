import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { MultimediaFile } from "./multimedia-file.entity"
import { Post } from "./post.entity"

@Entity('PostMultimediaFile')
export class PostMultimediaFile {
  
  @Column({ type: 'int' })
  fileId: number

  @Column({ type: 'int' })
  postId: number

  @PrimaryGeneratedColumn()
  id: number // Composite primary key can be handled differently

  @ManyToOne(() => MultimediaFile, (file) => file.postMultimediaFiles)
  @JoinColumn({ name: 'fileId' })
  file: MultimediaFile

  @ManyToOne(() => Post, (post) => post.multimediaFiles)
  @JoinColumn({ name: 'postId' })
  post: Post
}