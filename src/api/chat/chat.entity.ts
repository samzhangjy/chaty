import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public content!: string;

  @ManyToOne(() => User, (user) => user.messages)
  public sender!: User;

  @CreateDateColumn()
  public createdAt!: Date;
}
