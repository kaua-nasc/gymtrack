import { HttpException, HttpStatus } from '@nestjs/common';

export type ApplicationExceptionParams = {
  message: string;
  suggestedHttpStatusCode: HttpStatus;
  context?: any;
};

export class ApplicationException extends HttpException {
  readonly context: any;

  constructor(params: ApplicationExceptionParams) {
    super(params.message, params.suggestedHttpStatusCode);

    this.name = this.constructor.name;
    this.context = params.context;
  }
}
