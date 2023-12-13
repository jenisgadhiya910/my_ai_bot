import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { History } from "./History";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("longtext")
  message: string;

  @Column({ type: "varchar", nullable: true })
  prompt_name: string;

  @Column({ default: false })
  is_bot: boolean;

  @Column()
  history_id: number;

  @ManyToOne(() => History)
  @JoinColumn({ name: "history_id" })
  history: History;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
