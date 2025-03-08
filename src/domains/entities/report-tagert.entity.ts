import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Report } from './report.entity'
import { Post } from './post.entity'
import { Rate } from './rate.entity'
import { Customer } from './customer.entity'
import { EntityType } from './enum/value-object'

@Entity('ReportTarget')
@Check(`targetType IN ('Post', 'Rate', 'Customer')`)
@Check(`
  (targetType = 'Post' AND postId IS NOT NULL AND rateId IS NULL AND customerId IS NULL) OR
  (targetType = 'Rate' AND rateId IS NOT NULL AND postId IS NULL AND customerId IS NULL) OR
  (targetType = 'Customer' AND customerId IS NOT NULL AND postId IS NULL AND rateId IS NULL)
`) // Ensure that only the appropriate ID is set based on targetType
export class ReportTarget {
  @PrimaryGeneratedColumn()
  targetId: number

  @Column({
    type: "varchar",
    length: 20,
    nullable: false
  })
  targetType: string;

  @Column({ type: 'int', nullable: true })
  rateId: number

  @Column({ type: 'int', nullable: true })
  customerId: number

  @Column({ type: 'int', nullable: true })
  postId: number

  @OneToOne(() => Rate, (rate) => rate.reportTarget)
  @JoinColumn({ name: 'rateId' })
  rate: Rate

  @OneToOne(() => Customer, (customer) => customer.customerReportTarget)
  @JoinColumn({ name: 'customerId' })
  customer: Customer

  @OneToOne(() => Post, (post) => post.postReportTarget)
  @JoinColumn({ name: 'postId' })
  post: Post

  @OneToMany(() => Report, (report) => report.target)
  reports: Report[]
}
