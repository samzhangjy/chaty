import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import exceptionCodes from './exception-codes.helper';
import { ServiceException } from './exception.helper';

@Catch(ServiceException, HttpException)
export class HttpServiceExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter<ServiceException | HttpException>
{
  catch(exception: ServiceException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof ServiceException
        ? exception.statusCode
        : exception.getStatus();
    const errorCode =
      exception instanceof ServiceException
        ? exception.errorCode
        : exceptionCodes.common.UNKNOWN;
    let message = exception.message;
    if (exception instanceof HttpException) {
      const httpMessage = exception.getResponse();
      if (typeof httpMessage === 'string') message = httpMessage;
      else message = (httpMessage as any).message;
    }

    response.status(status).json({
      statusCode: status,
      status: 'error',
      message,
      errorCode,
    });
  }
}
