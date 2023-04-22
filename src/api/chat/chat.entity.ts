import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from './group/group.entity';
import { LastReadMessage } from '../user/lastReadMessage.entity';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  FILE = 'file',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public content!: string;

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  public sender?: User | null;

  @ManyToOne(() => Group, (group) => group.messages)
  public group!: Group;

  @OneToMany(
    () => LastReadMessage,
    (lastReadMessage) => lastReadMessage.message,
  )
  public readStats!: LastReadMessage[];

  @CreateDateColumn()
  public createdAt!: Date;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  public type!: MessageType;
}
