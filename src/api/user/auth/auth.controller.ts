import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../user.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { HttpServiceExceptionFilter } from '@/common/helper/exception-filter.helper';
import { AckStatus } from '@/common/helper/status.helper';

@Controller('auth')
@UseFilters(new HttpServiceExceptionFilter())
export class AuthController {
  @Inject(AuthService)
  private readonly service: AuthService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Body() body: RegisterDto) {
    return { ...AckStatus.success(), user: await this.service.register(body) };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return { ...AckStatus.success(), ...(await this.service.login(body)) };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Req() { user }: Request) {
    return this.service.refresh(user as User);
  }
}
