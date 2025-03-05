import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Post } from "./post.entity"

@Entity('InfoEdition')
export class InfoEdition {
  @PrimaryGeneratedColumn()
  infoId: number

  @Column({ type: 'int' })
  postId: number

  @Column({ type: 'int' })
  version: number

  @Column({ type: 'char', length: 100 })
  field: string

  @Column({ type: 'varchar', length: 1500 })
  value: string

  @CreateDateColumn()
  changedAt: Date

  @ManyToOne(() => Post, (post) => post.infoEditions)
  @JoinColumn({ name: 'postId' })
  post: Post
}