import { User } from '../../../api/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Group } from './group.entity';

export enum GroupRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity()
export class GroupToUser {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => Group, (group) => group.members)
  public group!: Group;

  @ManyToOne(() => User, (user) => user.joinedGroups)
  public user!: User;

  @Column({
    type: 'enum',
    enum: GroupRoles,
    default: GroupRoles.OWNER,
  })
  public role!: GroupRoles;
}
