import { User } from '../../user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import {
  GroupNotFoundException,
  MemberAlreadyExistsException,
  MemberNotFoundException,
} from './group.exception';
import { CreateGroupDto } from './group.dto';

@Injectable()
export class GroupService {
  @InjectRepository(Group)
  groupRepository: Repository<Group>;

  @InjectRepository(User)
  userRepository: Repository<User>;

  private async findGroupOrFail(groupId: number) {
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new GroupNotFoundException();
    }
    return group;
  }

  public async createGroup(data: CreateGroupDto) {
    const owner = await this.userRepository.findOneBy({ id: data.ownerId });
    if (!owner) {
      throw new MemberNotFoundException();
    }
    const members = [owner];
    for (const memberId of data.members) {
      const member = await this.userRepository.findOneBy({ id: memberId });
      if (!member) {
        throw new MemberNotFoundException();
      }
      members.push(member);
    }
    const group = new Group();
    group.owner = owner;
    group.members = members;
    group.name = data.name;
    return this.groupRepository.save(group);
  }

  public async joinGroup(groupId: number, user: User) {
    const group = await this.findGroupOrFail(groupId);
    if (group.members.find((member) => member.id === user.id)) {
      throw new MemberAlreadyExistsException();
    }
    group.members.push(user);
    return await this.groupRepository.save(group);
  }

  public async leaveGroup(groupId: number, user: User) {
    const group = await this.findGroupOrFail(groupId);
    if (!group.members.find((member) => member.id === user.id)) {
      throw new MemberNotFoundException();
    }
    group.members = group.members.filter((member) => member.id !== user.id);
    return await this.groupRepository.save(group);
  }
}
