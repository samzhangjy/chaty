import { User } from '../../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { FriendPermission } from './friendPreferences.entity';

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

  @Column({
    type: 'enum',
    enum: FriendPermission,
    default: FriendPermission.NORMAL,
  })
  public senderSetPermission!: FriendPermission;

  @Column({ nullable: true })
  public senderSetNickname?: string;

  @Column({
    type: 'enum',
    enum: FriendPermission,
    default: FriendPermission.NORMAL,
  })
  public targetSetPermission!: FriendPermission;

  @Column({ nullable: true })
  public targetSetNickname?: string;

  @Column({ nullable: true })
  public message?: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
