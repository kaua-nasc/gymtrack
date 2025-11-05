import { LoggerOptions } from 'pino';
import { Params, PinoLoggerModule } from '../service/pino-logger.service';

export const initPinoLogger = (appName: string): Params => {
  const env = process.env.NODE_ENV;
  const isDev = env === 'development';

  const pinoConfig: LoggerOptions = {
    level: process.env.LOG_LEVEL || 'debug',
    base: { appName, environment: env },
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };

  return {
    pinoHttp: pinoConfig,
  };
};

/**
 *
 * LoggerFactory is used only in the Nest.js main to replace Nest.js default logger.
 * But in the App we use the AppLogger instance due to the Dependency Injection.
 */
export const LoggerFactory = (appName: string) =>
  PinoLoggerModule.forRoot(initPinoLogger(appName));
