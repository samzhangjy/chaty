import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupToUser } from './groupToUser.entity';
import { JoinGroupRequest } from './joinGroupRequest.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('increment')
  public id!: number;

  @Column()
  public name!: string;

  @OneToMany(() => GroupToUser, (groupToUser) => groupToUser.group)
  public members!: GroupToUser[];

  @OneToMany(
    () => JoinGroupRequest,
    (joinGroupRequest) => joinGroupRequest.group,
  )
  public joinRequests!: JoinGroupRequest[];

  @CreateDateColumn()
  public createdAt!: Date;
}
