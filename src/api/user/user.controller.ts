import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/auth.guard';
import { UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async getUser(@Param('id') id: number) {
    return await this.service.getUser(id);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
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
