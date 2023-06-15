import { UserService } from '@/api/user/user.service';
import { channels } from '@/common/channels.constant';
import { HttpServiceExceptionFilter } from '@/common/helper/exception-filter.helper';
import { AckStatus } from '@/common/helper/status.helper';
import { ChatyRequest } from '@/common/helper/types.helper';
import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
  Request,
  ForbiddenException,
  Get,
  Query,
  UseFilters,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { JwtAuthGuard } from '../../user/auth/auth.guard';
import { MessageType } from '../chat.entity';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../chat.service';
import {
  CreateGroupDto,
  GroupRequestFilter,
  JoinGroupRequestDto,
  KickFromGroupDto,
  LeaveGroupDto,
  UpdateJoinGroupRequestStatusDto,
} from '../group/group.dto';
import { GroupService } from './group.service';
import { GroupRoles } from './groupToUser.entity';
import { JoinGroupRequestStatus } from './joinGroupRequest.entity';

@Controller('chat/group')
@UseGuards(JwtAuthGuard)
@UseFilters(new HttpServiceExceptionFilter())
export class GroupController {
  @Inject(ChatService)
  private readonly chatService: ChatService;

  @Inject(GroupService)
  private readonly groupService: GroupService;

  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(ChatGateway)
  private readonly gateway: ChatGateway;

  @Post(':id/join')
  async joinGroup(
    @Param('id') id: number,
    @Body() payload: JoinGroupRequestDto,
    @Request() req: ChatyRequest,
  ) {
    const request = await this.groupService.sendRequest({
      groupId: id,
      user: req.user,
      ...payload,
    });
    this.gateway.emitToSockets(
      request.group.members.find((member) => member.role === GroupRoles.OWNER)
        .user.socketId,
      channels.group.request.new,
      instanceToPlain(request, { enableCircularCheck: true }),
    );
    return AckStatus.success();
  }

  @Get(':id/requests')
  async getRequests(
    @Param('id') id: number,
    @Query('filter') filter: GroupRequestFilter,
    @Request() req: ChatyRequest,
  ) {
    if (
      !(await this.groupService.checkMemberRole(id, req.user.id, [
        GroupRoles.OWNER,
        GroupRoles.ADMIN,
      ]))
    ) {
      throw new ForbiddenException();
    }
    const requests = await this.groupService.getRequests({
      groupId: id,
      filter,
    });
    return {
      ...AckStatus.success(),
      requests,
    };
  }

  @Post(':id/requests/:requestId')
  async updateRequest(
    @Param('id') groupId: number,
    @Param('requestId') requestId: string,
    @Request() req: ChatyRequest,
    @Body() payload: UpdateJoinGroupRequestStatusDto,
  ) {
    const request = await this.groupService.updateRequest({
      ...payload,
      requestId,
      groupId,
      user: req.user,
    });
    if (request.status === JoinGroupRequestStatus.ACCEPTED) {
      const [response, sockets] = await this.chatService.sendMessage(
        {
          msg: `[JOIN_GROUP] ${request.user.username}`,
          type: MessageType.SYSTEM,
          groupId: request.group.id,
        },
        false,
      );
      this.gateway.emitToSockets(sockets, 'recvMessage', response);
    }
    return AckStatus.success();
  }

  @Post('create')
  async createGroup(
    @Request() req: ChatyRequest,
    @Body() payload: CreateGroupDto,
  ) {
    const group = await this.groupService.createGroup({
      ...payload,
      user: req.user,
    });
    return { group, ...AckStatus.success() };
  }

  @Post(':id/leave')
  async leaveGroup(
    @Request() req: ChatyRequest,
    @Param('id') groupId: number,
    @Body() payload: LeaveGroupDto,
  ) {
    const group = await this.groupService.leave(
      { ...payload, groupId },
      req.user,
    );
    await this.gateway.sendMessage(
      {
        groupId: group.id,
        msg: `[LEAVE_GROUP] ${req.user.username}`,
        type: MessageType.SYSTEM,
      },
      false,
    );
    return AckStatus.success();
  }

  @Post(':id/kick')
  async kickFromGroup(
    @Request() req: ChatyRequest,
    @Param('id') groupId: number,
    @Body() payload: KickFromGroupDto,
  ) {
    const target = await this.userService.getUser(payload.targetId, false);
    const group = await this.groupService.kick(groupId, req.user, target);
    await this.gateway.sendMessage(
      {
        groupId: group.id,
        msg: `[KICK_GROUP] ${req.user.username}, ${target.username}`,
        type: MessageType.SYSTEM,
      },
      false,
    );
    return AckStatus.success();
  }

  @Get(':id/members')
  async getGroupMembers(@Param('id') groupId: number) {
    const members = await this.groupService.getGroupMembers(groupId);
    return {
      ...AckStatus.success(),
      members,
    };
  }
}
