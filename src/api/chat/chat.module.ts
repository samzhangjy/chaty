import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../user/auth/auth.module';
import { ChatController } from './chat.controller';
import { Message } from './chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  imports: [AuthModule, TypeOrmModule.forFeature([Message]), ConfigModule],
})
export class ChatModule {}
