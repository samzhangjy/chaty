import { ChatyConfig } from '@/common/helper/config.helper';
import { paginateResponse } from '@/common/helper/pagination.helper';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { SendMessageDto } from './chat.dto';
import { Message, MessageType } from './chat.entity';
import { Group } from './group/group.entity';

@Injectable()
export class ChatService {
  @Inject(ConfigService)
  private readonly configService: ConfigService<ChatyConfig, true>;

  @InjectRepository(Message)
  private readonly messageRepository: Repository<Message>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Group)
  private readonly groupRepository: Repository<Group>;

  public async createMessage(msg: Message) {
    return await this.messageRepository.save(msg);
  }

  public async getMessages(query: {
    take: number;
    page: number;
    groupId: number;
  }) {
    const take = Math.min(
      query.take || 10,
      this.configService.get('query.limit', { infer: true }),
    );
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const data = await this.messageRepository.findAndCount({
      relations: ['group', 'sender'],
      where: {
        group: {
          id: query.groupId,
        },
      },
      take,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return paginateResponse(data, page, take);
  }

  public async sendMessage(
    payload: SendMessageDto,
    check = true,
  ): Promise<[Message, string[]]> {
    if (payload.type === MessageType.SYSTEM && payload.user && check) {
      throw new ForbiddenException('Forbidden to send message as system.');
    }

    let group: Group = null;
    let user: User = null;

    if (check) {
      user = await this.userRepository.findOne({
        where: { id: payload.user.id },
        relations: [
          'joinedGroups',
          'joinedGroups.group',
          'joinedGroups.user',
          'joinedGroups.group.members',
          'joinedGroups.group.members.user',
        ],
      });
      const groupToUser = user.joinedGroups.find(
        (group) => group.group?.id === payload.groupId,
      );
      if (!groupToUser) {
        throw new ForbiddenException();
      }
      group = groupToUser.group;
    } else {
      group = await this.groupRepository.findOne({
        where: {
          id: payload.groupId,
        },
        relations: ['members'],
      });
    }

    const message = await this.messageRepository.save({
      content: payload.msg,
      sender: user,
      type: payload.type,
      group,
    });

    const sockets = group.members
      .filter((member) => !!member.user?.socketId)
      .map((member) => member.user.socketId);

    if (message.sender) delete message.sender.joinedGroups;
    delete message.group.members;

    return [message, sockets];
  }

  public async handleConnection(socket: Socket, user: User) {
    return await this.userRepository.update(user.id, {
      socketId: socket.id,
      online: true,
    });
  }

  public async handleDisconnect(user: User) {
    return await this.userRepository.update(user.id, {
      socketId: null,
      online: false,
    });
  }
}
