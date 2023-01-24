import { Exclude, instanceToPlain } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../chat/chat.entity';
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

  toJSON() {
    return instanceToPlain(this, { enableCircularCheck: true });
  }
}
