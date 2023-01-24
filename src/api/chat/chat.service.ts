import { ChatyConfig } from '@/common/helper/config.helper';
import { paginateResponse } from '@/common/helper/pagination.helper';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { SendMessageDto } from './chat.dto';
import { Message } from './chat.entity';

@Injectable()
export class ChatService {
  @Inject(ConfigService)
  private readonly configService: ConfigService<ChatyConfig, true>;

  @InjectRepository(Message)
  private readonly messageRepository: Repository<Message>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  public async createMessage(msg: Message) {
    return await this.messageRepository.save(msg);
  }

  public async getMessages(
    sender: User,
    query: { take: number; page: number },
  ) {
    const take = Math.min(
      query.take || 10,
      this.configService.get('query.limit', { infer: true }),
    );
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const data = await this.messageRepository.findAndCount({
      relations: {
        sender: true,
      },
      where: {
        sender: {
          id: sender.id,
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

  public async handleSendMessage(payload: SendMessageDto) {
    const message = new Message();
    message.content = payload.msg;
    message.sender = payload.user;
    await this.messageRepository.save(message);
    return message;
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
