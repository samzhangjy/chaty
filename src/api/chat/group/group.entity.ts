import { User } from '@/api/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('increment')
  public id!: number;

  @Column()
  public name!: string;

  @ManyToOne(() => User, (user) => user.ownedGroups)
  public owner!: User;

  @ManyToMany(() => User, (user) => user.joinedGroups)
  @JoinTable()
  public members!: User[];

  @CreateDateColumn()
  createdAt: Date;
}
