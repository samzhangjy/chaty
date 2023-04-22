import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/auth.guard';
import { UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { HttpServiceExceptionFilter } from '@/common/helper/exception-filter.helper';
import { ChatyRequest } from '@/common/helper/types.helper';
import { AckStatus } from '@/common/helper/status.helper';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new HttpServiceExceptionFilter())
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: ChatyRequest) {
    const user = await this.service.getUser(req.user.id, true);
    return {
      ...AckStatus.success(),
      user,
    };
  }

  @Get('/current/joinedGroups')
  @UseGuards(JwtAuthGuard)
  async getJoinedGroups(@Request() req: ChatyRequest) {
    const joinedGroups = await this.service.getJoinedGroups(req.user.id);
    return { ...AckStatus.success(), joinedGroups };
  }

  @Post('/current/read/group/:groupId/:messageId')
  @UseGuards(JwtAuthGuard)
  async updateGroupMessageReadStatus(
    @Request() req: ChatyRequest,
    @Param('groupId') groupId: number,
    @Param('messageId') messageId: string,
  ) {
    await this.service.updateLastReadMessage(req.user.id, groupId, messageId);
    return AckStatus.success();
  }

  @Get('/current/unread/group/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupUnreadCount(
    @Request() req: ChatyRequest,
    @Param('groupId') groupId: number,
  ) {
    const unreadCount = await this.service.getGroupUnreadCount(
      req.user.id,
      groupId,
    );
    return { ...AckStatus.success(), unreadCount };
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUser(@Param('id') id: number) {
    return await this.service.getUser(id);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Body() body: UpdateUserDto,
    @Request() req: any,
    @Param('id') id: number,
  ) {
    if (req.user.id !== id) {
      throw new HttpException('Forbidden.', HttpStatus.FORBIDDEN);
    }
    return this.service.updateUser(id, body);
  }
}
