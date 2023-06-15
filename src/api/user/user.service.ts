import exceptionCodes from '@/common/helper/exception-codes.helper';
import { ServiceException } from '@/common/helper/exception.helper';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { GroupService } from '../chat/group/group.service';
import { LastReadMessage } from './lastReadMessage.entity';
import { Message } from '../chat/chat.entity';
import { GroupToUser } from '../chat/group/groupToUser.entity';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(LastReadMessage)
  private readonly lastReadMessageRepository: Repository<LastReadMessage>;

  @InjectRepository(Message)
  private readonly messageRepository: Repository<Message>;

  @InjectRepository(GroupToUser)
  private readonly groupToUserRepository: Repository<GroupToUser>;

  @Inject(GroupService)
  private readonly groupService: GroupService;

  public async getUser(id: number, loadRelations: boolean | string[] = true) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations:
        typeof loadRelations === 'boolean'
          ? ['joinedGroups', 'joinedGroups.group']
          : Array.isArray(loadRelations)
          ? loadRelations
          : undefined,
    });

    if (!user) {
      throw new ServiceException(
        'Cannot find user.',
        HttpStatus.NOT_FOUND,
        exceptionCodes.user.USER_NOT_FOUND,
      );
    }

    return user;
  }

  public async updateUser(id: number, body: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('Cannot find user.', HttpStatus.NOT_FOUND);
    }

    await this.userRepository.update(id, {
      username: body.username ?? user.username,
      email: body.email ?? user.email,
    });

    return this.userRepository.findOne({ where: { id } });
  }

  public async getJoinedGroups(userId: number) {
    const user = await this.getUser(userId, [
      'joinedGroups',
      'joinedGroups.group',
      'joinedGroups.group.members',
      'joinedGroups.group.members.user',
    ]);
    for (const group of user.joinedGroups) {
      group.group['lastMessage'] = await this.groupService.getLastMessageSent(
        group.group.id,
      );
      group.group['unreadCount'] = await this.getGroupUnreadCount(
        userId,
        group.group.id,
      );
    }
    user.joinedGroups.sort((a, b) => {
      if (!a.group['lastMessage'] || !b.group['lastMessage']) {
        if (a.group['lastMessage']) return -1;
        else if (b.group['lastMessage']) return 1;
        else if (a.group.createdAt > b.group.createdAt) return -1;
        else return 1;
      }
      return a.group['lastMessage'].createdAt > b.group['lastMessage'].createdAt
        ? -1
        : 1;
    });
    return user.joinedGroups;
  }

  public async getJoinedGroup(groupId: number, userId: number) {
    return this.groupToUserRepository.findOne({
      where: {
        group: { id: groupId },
        user: { id: userId },
      },
      relations: ['group', 'group.members', 'group.members.user'],
    });
  }

  public async updateLastReadMessage(
    userId: number,
    groupId: number,
    messageId: string,
  ) {
    const user = await this.getUser(userId);

    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new ServiceException(
        'Message not found.',
        HttpStatus.NOT_FOUND,
        exceptionCodes.user.MESSAGE_NOT_FOUND,
      );
    }

    let lastReadMessage = await this.lastReadMessageRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        message: {
          group: {
            id: groupId,
          },
        },
      },
    });

    if (!lastReadMessage) {
      lastReadMessage = new LastReadMessage();
    }

    lastReadMessage.message = message;
    lastReadMessage.readAt = new Date();
    lastReadMessage.user = user;

    await this.lastReadMessageRepository.save(lastReadMessage);
    return lastReadMessage;
  }

  public async getGroupUnreadCount(userId: number, groupId: number) {
    const lastReadMessage = await this.lastReadMessageRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        message: {
          group: {
            id: groupId,
          },
        },
      },
      relations: ['message'],
    });
    const lastReadTime = lastReadMessage?.message?.createdAt ?? new Date(1900);
    const unreadCount = await this.messageRepository.count({
      where: {
        createdAt: MoreThan(lastReadTime),
        group: {
          id: groupId,
        },
      },
    });
    return unreadCount - 1;
  }
}
