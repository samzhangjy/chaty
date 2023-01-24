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
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { WsGuard } from '../user/auth/auth.guard';
import { AuthHelper } from '../user/auth/auth.helper';
import { SendMessageDto } from './chat.dto';
import { WsExceptionFilter } from './chat.filter';
import { ChatService } from './chat.service';
import {
  CreateGroupDto,
  JoinGroupRequestDto,
  UpdateJoinGroupRequestStatusDto,
} from './group/group.dto';
import { GroupService } from './group/group.service';
import { GroupRoles } from './group/groupToUser.entity';

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
    const response = await this.chatService.handleSendMessage(payload);
    this.server.emit('recvMessage', response);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('createGroup')
  async handleCreateGroup(@MessageBody() payload: CreateGroupDto) {
    await this.groupService.createGroup(payload);
    this.server.to(payload.user.socketId).emit('createGroup', {
      status: 'success',
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinGroupRequest')
  async handleJoinGroupRequest(@MessageBody() payload: JoinGroupRequestDto) {
    const request = await this.groupService.sendJoinGroupRequest(payload);
    this.server
      .to(payload.user.socketId)
      .emit('joinGroupRequest', { status: 'success' });
    this.server
      .to(
        request.group.members.find((member) => member.role === GroupRoles.OWNER)
          .user.socketId,
      )
      .emit(
        'newJoinGroupRequest',
        instanceToPlain(request, { enableCircularCheck: true }),
      );
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('updateJoinGroupRequestStatus')
  async handleUpdateJoinGroupRequestStatus(
    @MessageBody() payload: UpdateJoinGroupRequestStatusDto,
  ) {
    await this.groupService.updateJoinGroupRequestStatus(payload);
    this.server
      .to(payload.user.socketId)
      .emit('updateJoinGroupRequestStatus', { status: 'success' });
  }

  async handleConnection(client: Socket) {
    try {
      const bearerToken = client.handshake.headers.authorization.split(' ')[1];

      const decoded = await this.authHelper.decode(bearerToken);
      const user = await this.authHelper.validateUser(decoded);

      if (!user) client.disconnect();

      this.chatService.handleConnection(client, user);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: any) {
    const bearerToken = client.handshake.headers.authorization.split(' ')[1];
    const decoded = await this.authHelper.decode(bearerToken);
    const user = await this.authHelper.validateUser(decoded);

    this.chatService.handleDisconnect(user);
  }
}
