import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { History } from "./History";
import { Prompt } from "./Prompt";
import * as bcrypt from "bcryptjs";
import { Setting } from "./Setting";
import { Document } from "./Document";
import { Company } from "./company";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ type: "longtext", nullable: true })
  profile: string;

  @Column({ type: "longtext", nullable: true })
  organization_profile: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  mode_input: string;

  @Column({ nullable: true })
  mode_value: string;

  @OneToMany(() => Prompt, (prompt) => prompt.user)
  prompts: Prompt[];

  @OneToMany(() => History, (history) => history.user)
  histories: History[];

  @OneToMany(() => Setting, (setting) => setting.user)
  settings: Setting[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: "varchar", unique: true, select: false })
  reset_password_token: string;

  @Column({ nullable: true, type: "timestamp" })
  reset_password_sent_at: Date;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];

  @OneToMany(() => Company, (company) => company.user)
  companies: Company[];

  setPassword(password: string): void {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    this.password = bcrypt.hashSync(password, salt);
  }

  checkPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
