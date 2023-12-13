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

export enum AiTool {
  CHAT_GPT = "chat_gpt",
  BARD = "bard",
}

@Entity()
export class ExecutedPrompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "varchar", length: 1000 })
  prompt: string;

  @Column({ type: "boolean" })
  is_bard: boolean;

  @Column({ type: "boolean" })
  is_chat_gpt: boolean;

  @Column({ type: "longtext", nullable: true })
  bard_response: string | null;

  @Column({ type: "longtext", nullable: true })
  chat_gpt_response: string | null;

  @Column()
  company_id: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "company_id" })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
