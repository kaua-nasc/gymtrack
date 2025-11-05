import { Injectable, LoggerService } from '@nestjs/common';
import { PinoLogger } from './pino-logger.service';

type ContextType = Record<string, unknown> & { exception?: unknown };

@Injectable()
export class AppLogger implements LoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('Application');
  }

  private getCallerContext(exception?: unknown) {
    if (exception && exception instanceof Error) {
      const caller = exception.stack?.split('\n')[1]?.trim()?.split(' ')[1];
      const callerClass = caller?.split('.')[0];
      const callerMethod = caller?.split('.').slice(1).join('.');
      return { originClass: callerClass, originMethod: callerMethod };
    }

    const stack = new Error().stack;
    const caller = stack?.split('\n')[4]?.trim()?.split(' ')[1];
    const callerClass = caller?.split('.')[0];
    const callerMethod = caller?.split('.').slice(1).join('.');
    return { originClass: callerClass, originMethod: callerMethod };
  }

  private getDefaultFields(exception?: unknown) {
    const { originClass, originMethod } = this.getCallerContext(exception);
    return { originClass, originMethod };
  }

  log(message: string, context: ContextType = {}) {
    this.logger.info(
      { ...context, ...this.getDefaultFields(context.exception) },
      message
    );
  }

  error(message: string, context: ContextType = {}) {
    this.logger.error(
      { ...context, ...this.getDefaultFields(context.exception) },
      message
    );
  }

  warn(message: string, context: ContextType = {}) {
    this.logger.warn(
      { ...context, ...this.getDefaultFields(context.exception) },
      message
    );
  }
}
