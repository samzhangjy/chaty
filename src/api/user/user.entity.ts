import { Exclude, instanceToPlain } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../chat/chat.entity';
import { Group } from '../chat/group/group.entity';

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

  @OneToMany(() => Message, (message) => message.sender)
  public messages!: Message[];

  @ManyToMany(() => Group, (group) => group.members)
  public joinedGroups!: Group[];

  @OneToMany(() => Group, (group) => group.owner)
  public ownedGroups!: Group[];

  toJSON() {
    return instanceToPlain(this);
  }
}
