import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const response = exception.getResponse() as any;
    if (typeof response !== 'string') {
      response.status = 'error';
    }
    const properException = new WsException(response);
    super.catch(properException, host);
  }
}
