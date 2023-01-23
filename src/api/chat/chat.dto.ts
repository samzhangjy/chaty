import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../user/user.entity';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  msg: string;

  user: User;
}
