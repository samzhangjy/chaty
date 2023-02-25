import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @Inject(ChatService)
  private readonly service: ChatService;

  @Get('messages')
  async getMessages(
    @Query('take') take: number,
    @Query('page') page: number,
    @Query('groupId') groupId: number,
  ) {
    return await this.service.getMessages({
      take,
      page,
      groupId,
    });
  }
}
