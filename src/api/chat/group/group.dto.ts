import { User } from '@/api/user/user.entity';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JoinGroupRequestStatus } from './joinGroupRequest.entity';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  members: number[];

  user: User;
}

export class JoinGroupRequestDto {
  @IsOptional()
  @IsString()
  message: string;

  user: User;
}

export class UpdateJoinGroupRequestStatusDto {
  @IsNotEmpty()
  @IsEnum(JoinGroupRequestStatus)
  status: JoinGroupRequestStatus;

  user: User;
}

export class LeaveGroupDto {
  @IsOptional()
  @IsNumber()
  transferOwnershipTo?: number;
}

export type GroupRequestFilter =
  | 'ALL'
  | 'HANDLED'
  | 'UNHANDLED'
  | 'ACCEPTED'
  | 'UNACCEPTED';

export class KickFromGroupDto {
  @IsNotEmpty()
  @IsNumber()
  targetId: number;

  user: User;
}
