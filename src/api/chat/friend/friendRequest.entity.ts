import { User } from '../../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import {
  FriendPermission,
  FriendPreferences,
} from './friendPreferences.entity';

export enum FriendRequestStatus {
  ACCEPTED = 'accepted',
  UNACCEPTED = 'unaccepted',
  WAITING = 'waiting',
}

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  public target!: User;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  public sender!: User;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.WAITING,
  })
  public status!: FriendRequestStatus;

  @OneToOne(() => FriendPreferences)
  @JoinColumn()
  public senderSetPreferences!: FriendPreferences;

  @OneToOne(() => FriendPreferences)
  @JoinColumn()
  public targetSetPreferences!: FriendPreferences;

  @Column({ nullable: true })
  public message?: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
