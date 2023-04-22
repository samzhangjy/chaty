import { HttpException } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export class ServiceException extends Error {
  public message: string;
  public statusCode: ErrorHttpStatusCode;
  public errorCode: string;

  constructor(
    message: string,
    statusCode: ErrorHttpStatusCode,
    errorCode: string,
  ) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  public getHttpException() {
    return new HttpException(
      { message: this.message, code: this.errorCode },
      this.statusCode,
    );
  }
}
