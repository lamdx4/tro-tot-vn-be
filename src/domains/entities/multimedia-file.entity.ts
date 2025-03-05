import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, OneToMany } from "typeorm"
import { PostMultimediaFile } from "./post-multimedia-file.entity"

@Entity('MultimediaFile')
export class MultimediaFile {
  
  @PrimaryGeneratedColumn()
  fileId: number

  @Column({ type: 'varchar', length: 150 })
  fileUrl: string

  @Column({ type: 'varchar', length: 20 })
  @Check(`"fileType" IN ('Video', 'Image')`)
  fileType: string

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => PostMultimediaFile, (postFile) => postFile.file)
  postMultimediaFiles: PostMultimediaFile[]
}