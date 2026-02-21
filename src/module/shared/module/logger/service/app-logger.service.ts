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

  /**
   * NestJS Logger signature:
   * log(message: unknown, context?: string)
   * log(message: unknown, ...optionalParams: unknown[])
   */
  log(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const fields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    if (typeof message === 'object') {
      this.logger.info({ ...fields, ...message });
    } else if (typeof message === 'string') {
      this.logger.info(fields, message);
    }
  }

  /**
   * NestJS Logger signature:
   * error(message: unknown, stack?: string, context?: string)
   * error(message: unknown, ...optionalParams: unknown[])
   */
  error(message: unknown, ...optionalParams: unknown[]) {
    let stack = optionalParams[0];
    const context = optionalParams[1];

    const err = message instanceof Error ? message : undefined;
    if (err && !stack) {
      stack = err.stack;
    }

    const fields: Record<string, unknown> = {
      ...this.getBaseFields(),
      ...this.getCallerContext(typeof stack === 'string' ? stack : undefined),
      context: typeof context === 'string' ? context : undefined,
    };

    if (err) {
      fields.err = err;
    }

    if (typeof message === 'object' && !(message instanceof Error)) {
      this.logger.error({ ...fields, ...message });
    } else if (typeof message === 'string') {
      this.logger.error(fields, err ? err.message : message);
    }
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const fields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    if (typeof message === 'object') {
      this.logger.warn({ ...fields, message });
    } else if (typeof message === 'string') {
      this.logger.warn(fields, message);
    }
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const fields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    if (typeof message === 'object') {
      this.logger.debug({ ...fields, ...message });
    } else if (typeof message === 'string') {
      this.logger.debug(fields, message);
    }
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    const context = optionalParams[optionalParams.length - 1];
    const fields = {
      ...this.getBaseFields(),
      ...this.getCallerContext(),
      context: typeof context === 'string' ? context : undefined,
    };

    if (typeof message === 'object') {
      this.logger.trace({ ...fields, ...message });
    } else if (typeof message === 'string') {
      this.logger.trace(fields, message);
    }
  }
}
