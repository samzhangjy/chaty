import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthHelper } from './auth.helper';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async register(body: RegisterDto) {
    const { username, email, password } = body;
    let user = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException(
        'User with the same email already exists',
        HttpStatus.CONFLICT,
      );
    }

    user = new User();

    user.username = username;
    user.email = email;
    user.password = this.helper.encodePassword(password);

    return this.repository.save(user);
  }

  public async login(body: LoginDto) {
    const { username, password } = body;
    const user = await this.repository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Wrong username or password',
        HttpStatus.FORBIDDEN,
      );
    }

    this.repository.update(user.id, { lastLoginAt: new Date() });

    return {
      token: this.helper.generateToken(user),
    };
  }

  public async refresh(user: User) {
    this.repository.update(user.id, { lastLoginAt: new Date() });
    return {
      token: this.helper.generateToken(user),
    };
  }
}
