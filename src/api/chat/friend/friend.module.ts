import { AuthModule } from '@/api/user/auth/auth.module';
import { User } from '@/api/user/user.entity';
import { UserService } from '@/api/user/user.service';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../chat.entity';
import { ChatModule } from '../chat.module';
import { ChatService } from '../chat.service';
import { Group } from '../group/group.entity';
import { FriendController } from './friend.controller';
import { Friend } from './friend.entity';
import { FriendService } from './friend.service';
import { FriendPreferences } from './friendPreferences.entity';
import { FriendRequest } from './friendRequest.entity';

@Module({
  controllers: [FriendController],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Friend,
      FriendRequest,
      FriendPreferences,
      Message,
      Group,
    ]),
    AuthModule,
    forwardRef(() => ChatModule),
  ],
  providers: [FriendService, UserService, ChatService],
})
export class FriendModule {}
