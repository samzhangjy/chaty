import { HttpException } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export class ServiceException extends Error {
  public message: string;
  public statusCode: ErrorHttpStatusCode;

  constructor(message: string, statusCode: ErrorHttpStatusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }

  public getHttpException() {
    return new HttpException(this.message, this.statusCode);
  }
}
