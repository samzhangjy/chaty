import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { GroupModule } from '../chat/group/group.module';
import { GroupService } from '../chat/group/group.service';
import { Group } from '../chat/group/group.entity';
import { GroupToUser } from '../chat/group/groupToUser.entity';
import { JoinGroupRequest } from '../chat/group/joinGroupRequest.entity';
import { Message } from '../chat/chat.entity';
import { LastReadMessage } from './lastReadMessage.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, GroupService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Group,
      GroupToUser,
      JoinGroupRequest,
      Message,
      LastReadMessage,
    ]),
    AuthModule,
    forwardRef(() => GroupModule),
  ],
})
export class UserModule {}
