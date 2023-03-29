import { Exclude, instanceToPlain } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../chat/chat.entity';
import { Friend } from '../chat/friend/friend.entity';
import { FriendRequest } from '../chat/friend/friendRequest.entity';
import { GroupToUser } from '../chat/group/groupToUser.entity';
import { JoinGroupRequest } from '../chat/group/joinGroupRequest.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public email!: string;

  @Exclude()
  @Column()
  public password!: string;

  @Column({ nullable: true })
  public username: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  public lastLoginAt: Date | null;

  @Column({ nullable: true })
  public socketId: string;

  @Column({ default: false })
  public online!: boolean;

  @OneToMany(() => Message, (message) => message.sender)
  public messages!: Message[];

  @OneToMany(() => GroupToUser, (groupToUser) => groupToUser.user)
  public joinedGroups!: GroupToUser[];

  @OneToMany(
    () => JoinGroupRequest,
    (joinGroupRequest) => joinGroupRequest.user,
  )
  public sentJoinRequests!: JoinGroupRequest[];

  @OneToMany(() => Friend, (friend) => friend.target)
  public friends!: Friend[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.target)
  public receivedFriendRequests!: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
  public sentFriendRequests!: FriendRequest[];

  toJSON() {
    return instanceToPlain(this, { enableCircularCheck: true });
  }
}
