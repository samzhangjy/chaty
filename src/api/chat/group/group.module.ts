import { AuthModule } from '@/api/user/auth/auth.module';
import { User } from '@/api/user/user.entity';
import { UserService } from '@/api/user/user.service';
import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../chat.entity';
import { ChatModule } from '../chat.module';
import { ChatService } from '../chat.service';
import { GroupController } from './group.controller';
import { Group } from './group.entity';
import { GroupService } from './group.service';
import { GroupToUser } from './groupToUser.entity';
import { JoinGroupRequest } from './joinGroupRequest.entity';

@Global()
@Module({
  providers: [GroupService, ChatService, UserService],
  exports: [GroupService],
  controllers: [GroupController],
  imports: [
    TypeOrmModule.forFeature([
      Group,
      User,
      GroupToUser,
      JoinGroupRequest,
      Message,
    ]),
    AuthModule,
    forwardRef(() => ChatModule),
  ],
})
export class GroupModule {}
