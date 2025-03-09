import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Post } from './post.entity'

@Entity('InfoEdition')
export class InfoEdition {
  @PrimaryGeneratedColumn()
  infoId: number

  @Column({ type: 'int', nullable: false })
  postId: number

  @Column({ type: 'int', nullable: false })
  version: number

  @Column({ type: 'char', length: 100, nullable: false })
  field: string

  @Column({ type: 'varchar', length: 1500, nullable: false })
  value: string

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  changedAt: Date

  @ManyToOne(() => Post, (post) => post.infoEditions)
  @JoinColumn({ name: 'postId' })
  post: Post
}
