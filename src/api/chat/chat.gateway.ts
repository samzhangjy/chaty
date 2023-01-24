import {
  Inject,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from '../user/auth/auth.guard';
import { AuthHelper } from '../user/auth/auth.helper';
import { SendMessageDto } from './chat.dto';
import { WsExceptionFilter } from './chat.filter';
import { ChatService } from './chat.service';
import { CreateGroupDto } from './group/group.dto';
import { GroupService } from './group/group.service';

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

  @Inject(ChatService)
  private readonly chatService: ChatService;

  @Inject(GroupService)
  private readonly groupService: GroupService;

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: SendMessageDto) {
    return await this.chatService.handleSendMessage(payload);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('createGroup')
  async handleCreateGroup(@MessageBody() payload: CreateGroupDto) {
    return await this.groupService.createGroup(payload);
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
    this.chatService.server = server;
  }
}
