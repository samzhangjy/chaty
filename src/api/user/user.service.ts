import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  public async getUser(id: number) {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('Cannot find user.', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async updateUser(id: number, body: UpdateUserDto) {
    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('Cannot find user.', HttpStatus.NOT_FOUND);
    }

    await this.repository.update(id, {
      username: body.username ?? user.username,
      email: body.email ?? user.email,
    });

    return this.repository.findOne({ where: { id } });
  }
}
