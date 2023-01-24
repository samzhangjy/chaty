import { User } from '@/api/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupService } from './group.service';

@Module({
  providers: [GroupService],
  exports: [GroupService],
  imports: [TypeOrmModule.forFeature([Group, User])],
})
export class GroupModule {}
