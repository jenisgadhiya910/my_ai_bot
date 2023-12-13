import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { ExecutedPrompt } from "./ExecutedPrompt";
import { User } from "./User";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  user_id: number;

  @OneToMany(() => ExecutedPrompt, (executed_prompt) => executed_prompt.company)
  executed_prompts: ExecutedPrompt[];

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
