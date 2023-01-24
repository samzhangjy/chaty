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
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @IsOptional()
  @IsString()
  message: string;

  user: User;
}

export class UpdateJoinGroupRequestStatusDto {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsEnum(JoinGroupRequestStatus)
  status: JoinGroupRequestStatus;

  user: User;
}
