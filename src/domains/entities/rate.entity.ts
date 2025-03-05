import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Check } from "typeorm"
import { Customer } from "./customer.entity"
import { Post } from "./post.entity"
import { Report } from "./report.entity"

@Entity('Rate')
export class Rate {
  @PrimaryGeneratedColumn()
  rateId: number

  @Column({ type: 'int' })
  raterId: number

  @Column({ type: 'int' })
  @Check(`"numRate" BETWEEN 1 AND 5`)
  numRate: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  comment: string

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'int' })
  postId: number

  @ManyToOne(() => Customer, (customer) => customer.rates)
  @JoinColumn({ name: 'raterId' })
  rater: Customer

  @ManyToOne(() => Post, (post) => post.rates)
  @JoinColumn({ name: 'postId' })
  post: Post

  @OneToMany(() => Report, (report) => report.rate)
  reports: Report[]
}