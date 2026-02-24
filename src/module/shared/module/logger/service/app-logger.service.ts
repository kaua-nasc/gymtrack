import { Injectable, LoggerService } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PinoLogger } from './pino-logger.service';

@Injectable()
export class AppLogger implements LoggerService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly clsService: ClsService
  ) {
    this.logger.setContext('Application');
  }

  private getCallerContext(stack?: string) {
    const stackToUse = stack || new Error().stack;
    if (!stackToUse) return { file: 'Unknown', originMethod: 'Unknown' };

    const lines = stackToUse.split('\n');
    const callerLine = lines.find((line, index) => {
      if (index === 0) return false;
      const lowerLine = line.toLowerCase();
      return (
        !lowerLine.includes('app-logger.service') &&
        !lowerLine.includes('pino-logger.service') &&
        !lowerLine.includes('node_modules')
      );
    });

    if (!callerLine) return { file: 'Unknown', originMethod: 'Unknown' };

    const match = callerLine.match(/at\s+(?:async\s+)?([^\s(]+)(?:\s+\(([^)]+)\))?/);
    const caller = match ? match[1] : 'Unknown';
    const fullPath = match?.[2] || callerLine.match(/\(([^)]+)\)/)?.[1] || '';

    const parts = caller.split('.');
    const originMethod = parts.length > 1 ? parts.slice(1).join('.') : parts[0];

    // Extract file path and make it relative to project root
    let file = fullPath ? fullPath.split(':')[0] : 'Unknown';
    if (file.includes('projects/gymtrack/')) {
      file = file.split('projects/gymtrack/')[1];
    }

    return { file, originMethod };
  }

  private getBaseFields() {
    return {
      userId: this.clsService.get('userId'),
      traceId: this.clsService.getId(),
    };
  }

  private parseMessage(message: unknown, fields: Record<string, unknown>) {
    let msg = '';
    const additionalFields = { ...fields };

    if (message instanceof Error) {
      msg = message.message;
      additionalFields.err = message;
      if (!additionalFields.stack) {
        additionalFields.stack = message.stack;
      }
    } else if (typeof message === 'object' && message !== null) {
      if ('message' in message && typeof message.message === 'string') {
        msg = message.message;
      }
      Object.assign(additionalFields, message);
    } else {
      msg = String(message);
    }

    return { msg, fields: additionalFields };
  }

  /**
   * NestJS Logger signature:
   * log(message: unknown, context?: string)
   * log(message: unknown, ...optionalParams: unknown[])
   */
  log(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const baseFields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    const { msg, fields } = this.parseMessage(message, baseFields);
    this.logger.info(fields, msg);
  }

  /**
   * NestJS Logger signature:
   * error(message: unknown, stack?: string, context?: string)
   * error(message: unknown, ...optionalParams: unknown[])
   */
  error(message: unknown, ...optionalParams: unknown[]) {
    const stack = optionalParams[0];
    const context = optionalParams[1];

    const baseFields: Record<string, unknown> = {
      ...this.getBaseFields(),
      ...this.getCallerContext(typeof stack === 'string' ? stack : undefined),
      context: typeof context === 'string' ? context : undefined,
    };

    if (typeof stack === 'string') {
      baseFields.stack = stack;
    }

    const { msg, fields } = this.parseMessage(message, baseFields);
    this.logger.error(fields, msg);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const baseFields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    const { msg, fields } = this.parseMessage(message, baseFields);
    this.logger.warn(fields, msg);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const baseFields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    const { msg, fields } = this.parseMessage(message, baseFields);
    this.logger.debug(fields, msg);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const baseFields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    const { msg, fields } = this.parseMessage(message, baseFields);
    this.logger.trace(fields, msg);
  }
}
