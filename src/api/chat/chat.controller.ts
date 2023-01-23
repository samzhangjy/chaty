import {
  Controller,
  Get,
  Inject,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @Inject(ChatService)
  private readonly service: ChatService;

  @Get('messages')
  async getMessages(
    @Request() request: any,
    @Query('take') take: number,
    @Query('page') page: number,
  ) {
    return await this.service.getMessages(request.user, { take, page });
  }
}
