import exceptionCodes from '@/common/helper/exception-codes.helper';
import { ServiceException } from '@/common/helper/exception.helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelationByString,
  FindOptionsRelations,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Message } from '../chat.entity';
import {
  CreateGroupDto,
  GroupRequestFilter,
  JoinGroupRequestDto,
  LeaveGroupDto,
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

  @InjectRepository(Message)
  private readonly messageRepository: Repository<Message>;

  public async findGroupOrFail(
    groupId: number,
    loadRelations:
      | boolean
      | FindOptionsRelations<Group>
      | FindOptionsRelationByString = false,
  ) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: loadRelations
        ? typeof loadRelations === 'boolean'
          ? ['members', 'members.user']
          : loadRelations
        : undefined,
    });
    if (!group) {
      throw new GroupNotFoundException();
    }
    return group;
  }

  public async checkMemberRole(
    groupId: number,
    userId: number,
    roles: GroupRoles | GroupRoles[],
  ) {
    const groupToUser = await this.groupToUserRepository.findOne({
      where: {
        group: {
          id: groupId,
        },
        user: {
          id: userId,
        },
      },
    });
    if (!groupToUser) {
      throw new ServiceException(
        'Group or member not found.',
        HttpStatus.NOT_FOUND,
        exceptionCodes.chat.group.GROUP_OR_MEMBER_NOT_FOUND,
      );
    }
    return (
      (Array.isArray(roles) && roles.includes(groupToUser.role)) ||
      roles === groupToUser.role
    );
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

    delete group.members;
    return group;
  }

  public async sendRequest({
    groupId,
    user,
    message,
  }: JoinGroupRequestDto & {
    groupId: number;
  }) {
    const group = await this.findGroupOrFail(groupId, true);
    if (group.members.find((member) => member.user.id === user.id)) {
      throw new MemberAlreadyExistsException();
    }

    return await this.joinGroupRequestRepository.save({
      status: JoinGroupRequestStatus.WAITING,
      group,
      user,
      message,
    });
  }

  public async getRequests({
    groupId,
    filter,
  }: {
    groupId: number;
    filter: GroupRequestFilter;
  }) {
    const requests = await this.joinGroupRequestRepository.find({
      where: {
        group: { id: groupId },
        status:
          filter === 'UNHANDLED'
            ? JoinGroupRequestStatus.WAITING
            : filter === 'ACCEPTED'
            ? JoinGroupRequestStatus.ACCEPTED
            : filter === 'UNACCEPTED'
            ? JoinGroupRequestStatus.UNACCEPTED
            : filter === 'HANDLED'
            ? In([
                JoinGroupRequestStatus.ACCEPTED,
                JoinGroupRequestStatus.UNACCEPTED,
              ])
            : undefined,
      },
      order: {
        createdAt: 'desc',
      },
      relations: ['user'],
    });
    return requests;
  }

  public async updateRequest({
    requestId,
    groupId,
    status,
    user,
  }: UpdateJoinGroupRequestStatusDto & {
    requestId: string;
    groupId: number;
    user: User;
  }) {
    const request = await this.joinGroupRequestRepository.findOne({
      where: {
        id: requestId,
      },
      relations: ['group', 'user'],
    });
    if (request.group.id !== groupId) {
      throw new ServiceException(
        'Request not found with given group.',
        HttpStatus.NOT_FOUND,
        exceptionCodes.chat.group.JOIN_GROUP_REQUEST_NOT_FOUND,
      );
    }
    if (
      !(await this.checkMemberRole(groupId, user.id, [
        GroupRoles.OWNER,
        GroupRoles.ADMIN,
      ]))
    ) {
      throw new ServiceException(
        'Forbidden.',
        HttpStatus.FORBIDDEN,
        exceptionCodes.common.FORBIDDEN,
      );
    }
    await this.joinGroupRequestRepository.update(requestId, {
      status,
    });
    request.status = status;
    if (request.status === JoinGroupRequestStatus.ACCEPTED) {
      await this.join(request.group.id, request.user);
    }
    return request;
  }

  public async join(groupId: number, user: User) {
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

  public async leave(
    { groupId, transferOwnershipTo }: LeaveGroupDto & { groupId: number },
    user: User,
  ) {
    const group = await this.findGroupOrFail(groupId, true);
    if (!group.members.find((member) => member.user.id === user.id)) {
      throw new MemberNotFoundException();
    }
    const isCurrentUserOwner = !!group.members.find(
      (member) =>
        member.user.id === user.id && member.role === GroupRoles.OWNER,
    );
    const futureOwnerGTUId = group.members.find(
      (member) =>
        member.user.id === transferOwnershipTo &&
        transferOwnershipTo !== user.id,
    )?.id;
    if (isCurrentUserOwner && (!transferOwnershipTo || !futureOwnerGTUId)) {
      throw new ServiceException(
        'You must declare a valid user to transfer ownership to.',
        HttpStatus.BAD_REQUEST,
        exceptionCodes.chat.group.OWNERSHIP_TRANSFER_REQUIRED_BEFORE_LEAVE,
      );
    } else if (isCurrentUserOwner) {
      await this.groupToUserRepository.update(futureOwnerGTUId, {
        role: GroupRoles.OWNER,
      });
    }
    await this.groupToUserRepository.delete({
      group: { id: group.id },
      user: { id: user.id },
    });
    group.members = group.members.filter(
      (member) => member.user.id !== user.id,
    );
    const newGroup = await this.groupRepository.save(group);
    return newGroup;
  }

  public async kick(groupId: number, handler: User, target: User) {
    const group = await this.findGroupOrFail(groupId, true);
    const handlerRole = group.members.find(
      (member) => member.user.id === handler.id,
    )?.role;
    if (
      !group.members.find(
        (member) =>
          member.user.id === handler.id &&
          [GroupRoles.OWNER, GroupRoles.ADMIN].includes(member.role),
      )
    ) {
      throw new ServiceException(
        'Handler with given id does not exist or does not have enough permission.',
        HttpStatus.NOT_FOUND,
        exceptionCodes.chat.group.KICK_FORBIDDEN,
      );
    }
    if (
      group.members.find(
        (member) =>
          member.user.id === target.id &&
          (handlerRole === GroupRoles.ADMIN
            ? [GroupRoles.OWNER, GroupRoles.ADMIN]
            : [GroupRoles.OWNER]
          ).includes(member.role),
      )
    ) {
      throw new ServiceException(
        'User with given id have higher or equal permission with handler.',
        HttpStatus.FORBIDDEN,
        exceptionCodes.chat.group.KICK_REQUIRES_HIGHER_PERMISSION,
      );
    }
    return await this.leave({ groupId }, target);
  }

  public async getGroupMembers(groupId: number) {
    return (await this.findGroupOrFail(groupId, true)).members;
  }

  public async getLastMessageSent(groupId: number) {
    const message = await this.messageRepository.findOne({
      where: {
        group: {
          id: groupId,
        },
        sender: {
          username: Not(IsNull()),
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['sender'],
    });
    return message;
  }
}
