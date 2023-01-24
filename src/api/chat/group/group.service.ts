import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import {
  CreateGroupDto,
  JoinGroupRequestDto,
  UpdateJoinGroupRequestStatusDto,
} from './group.dto';
import { Group } from './group.entity';
import {
  GroupNotFoundException,
  MemberAlreadyExistsException,
  MemberNotFoundException,
} from './group.exception';
import { GroupRoles, GroupToUser } from './groupToUser.entity';
import {
  JoinGroupRequest,
  JoinGroupRequestStatus,
} from './joinGroupRequest.entity';

@Injectable()
export class GroupService {
  @InjectRepository(Group)
  private readonly groupRepository: Repository<Group>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(GroupToUser)
  private readonly groupToUserRepository: Repository<GroupToUser>;

  @InjectRepository(JoinGroupRequest)
  private readonly joinGroupRequestRepository: Repository<JoinGroupRequest>;

  private async findGroupOrFail(groupId: number, loadRelations = false) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: loadRelations ? ['members', 'members.user'] : undefined,
    });
    if (!group) {
      throw new GroupNotFoundException();
    }
    return group;
  }

  public async createGroup({
    name: groupName,
    user,
    members: memberIds,
  }: CreateGroupDto) {
    const group = await this.groupRepository.save({
      members: [],
      name: groupName,
    });

    const owner = await this.groupToUserRepository.save({
      role: GroupRoles.OWNER,
      user,
      group,
    });
    const members: GroupToUser[] = [owner];
    for (const memberId of memberIds) {
      const member = await this.userRepository.findOneBy({ id: memberId });
      if (!member) {
        throw new MemberNotFoundException();
      }
      members.push(
        await this.groupToUserRepository.save({
          user: member,
          role: GroupRoles.MEMBER,
          group,
        }),
      );
    }
    group.members = members;

    await this.groupRepository.save(group);
  }

  public async sendJoinGroupRequest({ groupId, user }: JoinGroupRequestDto) {
    const group = await this.findGroupOrFail(groupId, true);
    if (group.members.find((member) => member.user.id === user.id)) {
      throw new MemberAlreadyExistsException();
    }

    return await this.joinGroupRequestRepository.save({
      status: JoinGroupRequestStatus.WAITING,
      group,
      user,
    });
  }

  public async updateJoinGroupRequestStatus({
    requestId,
    status,
  }: UpdateJoinGroupRequestStatusDto) {
    await this.joinGroupRequestRepository.update(requestId, {
      status,
    });
    const request = await this.joinGroupRequestRepository.findOne({
      where: {
        id: requestId,
      },
      relations: ['group', 'user'],
    });

    if (request.status === JoinGroupRequestStatus.ACCEPTED) {
      await this.joinGroup(request.group.id, request.user);
    }
    return request;
  }

  public async joinGroup(groupId: number, user: User) {
    const group = await this.findGroupOrFail(groupId, true);
    if (group.members.find((member) => member.user.id === user.id)) {
      throw new MemberAlreadyExistsException();
    }
    const member = await this.groupToUserRepository.save({
      role: GroupRoles.MEMBER,
      user,
      group,
    });
    group.members.push(member);
    return await this.groupRepository.save(group);
  }

  public async leaveGroup(groupId: number, user: User) {
    const group = await this.findGroupOrFail(groupId, true);
    if (!group.members.find((member) => member.user.id === user.id)) {
      throw new MemberNotFoundException();
    }
    group.members = group.members.filter(
      (member) => member.user.id !== user.id,
    );
    return await this.groupRepository.save(group);
  }
}
