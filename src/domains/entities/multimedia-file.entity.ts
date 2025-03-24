import { Entity, PrimaryGeneratedColumn, Column, Check, CreateDateColumn, OneToMany } from "typeorm"
import { PostMultimediaFile } from "./post-multimedia-file.entity"
import { MultimediaType } from "./enum/value-object";

@Entity('MultimediaFile')
@Check(`fileType IN ('Image', 'Video')`)
export class MultimediaFile {
  @PrimaryGeneratedColumn()
  fileId: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  fileUrl: string;

  @Column({
    type: "varchar",
    length: 20,
    nullable: true
  })
  fileType: string;

  @Column({ 
    type: "datetime", 
    default: () => "CURRENT_TIMESTAMP" 
  })
  createdAt: Date;

  @OneToMany(() => PostMultimediaFile, postFile => postFile.file)
  postFiles: PostMultimediaFile[];
}