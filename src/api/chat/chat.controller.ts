import {
  Controller,
  Get,
  Inject,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { ChatService } from './chat.service';
import { HttpServiceExceptionFilter } from '@/common/helper/exception-filter.helper';

@Controller('chat')
@UseGuards(JwtAuthGuard)
@UseFilters(new HttpServiceExceptionFilter())
export class ChatController {
  @Inject(ChatService)
  private readonly service: ChatService;

  @Get('messages')
  async getMessages(
    @Query('take') take: number,
    @Query('page') page: number,
    @Query('skip') skip: number,
    @Query('groupId') groupId: number,
  ) {
    return await this.service.getMessages({
      take,
      page,
      groupId,
      skip,
    });
  }
}
