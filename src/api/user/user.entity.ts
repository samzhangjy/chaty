import { classToPlain, Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../chat/chat.entity';

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

  toJSON() {
    return classToPlain(this);
  }
}
