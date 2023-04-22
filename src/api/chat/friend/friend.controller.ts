import { JwtAuthGuard } from '@/api/user/auth/auth.guard';
import { HttpServiceExceptionFilter } from '@/common/helper/exception-filter.helper';
import { AckStatus } from '@/common/helper/status.helper';
import { ChatyRequest } from '@/common/helper/types.helper';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SendFriendRequestDto, UpdateFriendRequestDto } from './friend.dto';
import { FriendRequestFilter, FriendService } from './friend.service';
import { FriendRequestStatus } from './friendRequest.entity';

@Controller('chat/friend')
@UseGuards(JwtAuthGuard)
@UseFilters(new HttpServiceExceptionFilter())
export class FriendController {
  @Inject(FriendService)
  private readonly friendService: FriendService;

  @Post('/add/:id')
  async addFriend(
    @Param('id') targetId: number,
    @Body() body: SendFriendRequestDto,
    @Request() req: ChatyRequest,
  ) {
    const request = await this.friendService.sendFriendRequest({
      ...body,
      friendId: targetId,
      user: req.user,
    });
    return { ...AckStatus.success(), request };
  }

  @Get('/requests/sent')
  async getSentFriendRequests(
    @Request() req: ChatyRequest,
    @Query('filter') filter: FriendRequestFilter = 'ALL',
    @Query('take') take: number,
    @Query('page') page: number,
  ) {
    const requests = await this.friendService.getFriendRequests({
      user: req.user,
      filter,
      take,
      page,
      mode: 'sent',
    });
    return { ...AckStatus.success(), ...requests };
  }

  @Get('/requests/received')
  async getReceivedFriendRequests(
    @Request() req: ChatyRequest,
    @Query('filter') filter: FriendRequestFilter = 'ALL',
    @Query('take') take: number,
    @Query('page') page: number,
  ) {
    const requests = await this.friendService.getFriendRequests({
      user: req.user,
      filter,
      take,
      page,
      mode: 'received',
    });
    return { ...AckStatus.success(), ...requests };
  }

  @Get('/requests/:id')
  async getFriendRequest(
    @Request() req: ChatyRequest,
    @Param('id') requestId: string,
  ) {
    const request = await this.friendService.getFriendRequest(
      requestId,
      ['sender', 'target'],
      req.user,
    );
    return { ...AckStatus.success(), request };
  }

  @Put('/requests/:id')
  async updateFriendRequestStatus(
    @Request() req: ChatyRequest,
    @Param('id') requestId: string,
    @Body() payload: UpdateFriendRequestDto,
  ) {
    await this.friendService.updateFriendRequest({
      ...payload,
      requestId,
      user: req.user,
    });
    return AckStatus.success();
  }

  @Get('/current')
  async getFriends(@Request() req: ChatyRequest) {
    const friends = await this.friendService.getFriends(req.user);
    return { ...AckStatus.success(), friends };
  }
}
