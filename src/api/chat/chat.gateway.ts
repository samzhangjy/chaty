import { channels } from '@/common/channels.constant';
import { AckStatus } from '@/common/helper/status.helper';
import {
  ClassSerializerInterceptor,
  Inject,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
import { GroupService } from './group/group.service';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public readonly server: Server;

  @Inject(AuthHelper)
  private readonly authHelper: AuthHelper;

  @Inject(ChatService)
  private readonly chatService: ChatService;

  @Inject(GroupService)
  private readonly groupService: GroupService;

  emitToSockets(sockets: string[] | string, event: string, message: any) {
    return this.server.to(sockets).emit(event, message);
  }

  async emitToGroup(groupId: number, event: string, message: any) {
    const members = await this.groupService.getGroupMembers(groupId);
    return this.emitToSockets(
      members
        .filter((member) => member.user.online)
        .map((member) => member.user.socketId),
      event,
      message,
    );
  }

  async sendMessage(payload: SendMessageDto, check = true) {
    const [response, sockets] = await this.chatService.sendMessage(
      payload,
      check,
    );
    this.emitToSockets(sockets, channels.group.message.recv, response);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(channels.group.message.send)
  async handleSendMessage(@MessageBody() payload: SendMessageDto) {
    await this.sendMessage(payload);
    return AckStatus.success();
  }

  async handleConnection(client: Socket) {
    try {
      const bearerToken = client.handshake.headers.authorization.split(' ')[1];

      const decoded = await this.authHelper.decode(bearerToken);
      const user = await this.authHelper.validateUser(decoded);

      if (!user) {
        client.disconnect();
        return;
      }

      this.chatService.handleConnection(client, user);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const bearerToken = client.handshake.headers.authorization.split(' ')[1];
    const decoded = await this.authHelper.decode(bearerToken);
    const user = await this.authHelper.validateUser(decoded);

    if (!user) return;

    this.chatService.handleDisconnect(user);
  }
}
