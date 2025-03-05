import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "./customer.entity"
import { Post } from "./post.entity"

@Entity('SavedPost')
export class SavedPost {
  @PrimaryGeneratedColumn()
  favoriteListId: number

  @Column({ type: 'int' })
  customerId: number

  @Column({ type: 'int' })
  postId: number

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Customer, (customer) => customer.savedPosts)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @ManyToOne(() => Post, (post) => post.savedPosts)
  @JoinColumn({ name: 'postId' })
  post: Post
}