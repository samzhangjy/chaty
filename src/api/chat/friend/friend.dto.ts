import { User } from '@/api/user/user.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FriendPermission } from './friendPreferences.entity';
import { FriendRequestStatus } from './friendRequest.entity';

export class SendFriendRequestDto {
  @IsOptional()
  @IsEnum(FriendPermission)
  permission?: FriendPermission;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  message?: string;

  user: User;
}

export class UpdateFriendRequestDto {
  @IsNotEmpty()
  @IsEnum(FriendRequestStatus)
  status: FriendRequestStatus;

  @IsOptional()
  @IsEnum(FriendPermission)
  permission?: FriendPermission;

  @IsOptional()
  @IsString()
  nickname?: string;

  user: User;
}

export class AddFriendDto {
  @IsNotEmpty()
  @IsUUID()
  requestId: string;
}
