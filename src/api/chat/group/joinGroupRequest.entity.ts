import { User } from '../../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';

export enum JoinGroupRequestStatus {
  ACCEPTED = 'accepted',
  UNACCEPTED = 'unaccepted',
  WAITING = 'waiting',
}

@Entity()
export class JoinGroupRequest {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => Group, (group) => group.joinRequests)
  public group!: Group;

  @ManyToOne(() => User, (user) => user.sentJoinRequests)
  public user!: User;

  @Column({
    type: 'enum',
    enum: JoinGroupRequestStatus,
    default: JoinGroupRequestStatus.WAITING,
  })
  public status!: JoinGroupRequestStatus;

  @Column({ nullable: true })
  public message?: string;

  @CreateDateColumn()
  public createdAt!: Date;
}
