import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from '../user/user.entity';
import { MessageType } from './chat.entity';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  msg: string;

  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  user?: User;
}
