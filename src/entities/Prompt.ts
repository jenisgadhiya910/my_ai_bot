import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./company";
import { User } from "./User";

export enum AiTool {
  CHAT_GPT = "chat_gpt",
  BARD = "bard",
}

@Entity()
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: "varchar", length: 1000 })
  prompt: string;

  @Column({ default: false, type: "boolean" })
  is_default: boolean;

  @Column({ nullable: true })
  order: number;

  @Column({ default: true, type: "boolean" })
  is_active: boolean;

  @Column({ type: "longtext", nullable: true })
  icon: string;

  @Column({ default: `${AiTool.CHAT_GPT}` })
  ai_tool: string;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  company_id: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
