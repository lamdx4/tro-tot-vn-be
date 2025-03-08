import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Report } from "./report.entity"

@Entity('ActionTaken')
export class ActionTaken {
  @PrimaryGeneratedColumn()
  actionId: number;

  @Column({ type: "varchar", length: 70 })
  description: string;

  @OneToMany(() => Report, report => report.action)
  reports: Report[];
}