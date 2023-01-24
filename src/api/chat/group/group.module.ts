import { User } from '@/api/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupService } from './group.service';
import { GroupToUser } from './groupToUser.entity';
import { JoinGroupRequest } from './joinGroupRequest.entity';

@Module({
  providers: [GroupService],
  exports: [GroupService],
  imports: [
    TypeOrmModule.forFeature([Group, User, GroupToUser, JoinGroupRequest]),
  ],
})
export class GroupModule {}
