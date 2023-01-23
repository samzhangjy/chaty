import { ChatyConfig } from '@/common/helper/config.helper';
import { paginateResponse } from '@/common/helper/pagination.helper';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { SendMessageDto } from './chat.dto';
import { Message } from './chat.entity';

@Injectable()
export class ChatService {
  @Inject(ConfigService)
  private readonly configService: ConfigService<ChatyConfig, true>;

  @InjectRepository(Message)
  private readonly repository: Repository<Message>;

  public server: Server;

  public async createMessage(msg: Message) {
    return await this.repository.save(msg);
  }

  public async getMessages(
    sender: User,
    query: { take: number; page: number },
  ) {
    const take = Math.min(
      query.take || 10,
      this.configService.get('query.limit', { infer: true }),
    );
    console.log(take, typeof take);
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const data = await this.repository.findAndCount({
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
    await this.repository.save(message);
    this.server.emit('recvMessage', message);
    return message;
  }
}
