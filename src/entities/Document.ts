import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { Tag } from "./Tag";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file_name: string;

  @Column()
  file_url: string;

  @Column({ default: () => `'${uuidv4()}'`, unique: true })
  guid: string;

  @ManyToOne(() => User, (user) => user.documents)
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.documents)
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
