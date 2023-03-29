import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FriendPermission {
  NORMAL = 'normal',
  CHAT_ONLY = 'chat-only',
}

@Entity()
export class FriendPreferences {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({
    type: 'enum',
    enum: FriendPermission,
    default: FriendPermission.NORMAL,
  })
  public permission!: FriendPermission;

  @Column({ nullable: true })
  public nickname?: string;
}
