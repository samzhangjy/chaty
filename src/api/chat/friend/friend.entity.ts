import { User } from '@/api/user/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendPreferences } from './friendPreferences.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => User, (user) => user.friends)
  public target!: User;

  @OneToOne(() => FriendPreferences)
  @JoinColumn()
  public preferences!: FriendPreferences;

  @CreateDateColumn()
  public createdAt!: Date;
}
