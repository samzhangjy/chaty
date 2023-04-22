import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../chat/chat.entity';
import { User } from './user.entity';

@Entity()
export class LastReadMessage {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => Message, (message) => message.readStats)
  public message!: Message;

  @ManyToOne(() => User, (user) => user.lastReadMessages)
  public user!: User;

  @Column()
  public readAt!: Date;
}
