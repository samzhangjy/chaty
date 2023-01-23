import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { User } from '../user.entity';
import { AuthHelper } from './auth.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  public handleRequest(err: any, user: User): any {
    return user;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const { user } = context.switchToHttp().getRequest();

    return !!user;
  }
}

@Injectable()
export class WsGuard extends AuthGuard('jwt') implements IAuthGuard {
  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  public async canActivate(context: ExecutionContext) {
    try {
      const bearerToken = context
        .getArgs()[0]
        .handshake.headers.authorization.split(' ')[1];

      const decoded = await this.helper.decode(bearerToken);
      const user = await this.helper.validateUser(decoded);

      context.switchToWs().getData().user = user;

      return !!user;
    } catch (e) {
      throw new WsException('Unauthorized');
    }
  }
}

export type WsUserInjection = {
  user: User;
};
