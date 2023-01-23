import {
  Inject,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { WsGuard } from '../user/auth/auth.guard';
import { AuthHelper } from '../user/auth/auth.helper';
import { SendMessageDto } from './chat.dto';
import { Message } from './chat.entity';
import { WsExceptionFilter } from './chat.filter';
import { ChatService } from './chat.service';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  private readonly server: Server;

  @Inject(AuthHelper)
  private readonly authHelper: AuthHelper;

  @InjectRepository(Message)
  private readonly repository: Repository<Message>;

  @Inject(ChatService)
  private readonly service: ChatService;

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: SendMessageDto) {
    return await this.service.handleSendMessage(payload);
  }

  async handleConnection(client: Socket) {
    try {
      const bearerToken = client.handshake.headers.authorization.split(' ')[1];

      const decoded = await this.authHelper.decode(bearerToken);
      const user = await this.authHelper.validateUser(decoded);

      if (!user) client.disconnect();
    } catch {
      client.disconnect();
    }
  }

  afterInit(server: Server) {
    this.service.server = server;
  }
}
