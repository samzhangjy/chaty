import { AuthModule } from '@/api/user/auth/auth.module';
import { LastReadMessage } from '@/api/user/lastReadMessage.entity';
import { User } from '@/api/user/user.entity';
import { UserService } from '@/api/user/user.service';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../chat.entity';
import { ChatModule } from '../chat.module';
import { ChatService } from '../chat.service';
import { Group } from '../group/group.entity';
import { GroupModule } from '../group/group.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendPreferences } from './friendPreferences.entity';
import { FriendRequest } from './friendRequest.entity';
import { GroupToUser } from '../group/groupToUser.entity';

@Module({
  controllers: [FriendController],
  imports: [
    TypeOrmModule.forFeature([
      User,
      FriendRequest,
      FriendPreferences,
      Message,
      Group,
      LastReadMessage,
      GroupToUser,
    ]),
    AuthModule,
    forwardRef(() => ChatModule),
    forwardRef(() => GroupModule),
  ],
  providers: [FriendService, UserService, ChatService],
})
export class FriendModule {}
