import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

@Injectable()
export class AuthHelper {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  private readonly jwt: JwtService;

  constructor(jwt: JwtService) {
    this.jwt = jwt;
  }

  public async decode(token: string) {
    return this.jwt.decode(token, null);
  }

  public async validateUser(decoded: any) {
    return this.repository.findOne({
      where: { id: decoded.id },
    });
  }

  public generateToken(user: User) {
    return this.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: '30d' },
    );
  }

  public isPasswordValid(password: string, userPassword: string) {
    return bcrypt.compareSync(password, userPassword);
  }

  public encodePassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  public async validate(token: string) {
    const decoded = this.jwt.verify(token);

    if (!decoded) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const user = await this.validateUser(decoded);

    if (!user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
