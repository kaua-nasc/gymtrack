import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import pino from 'pino';
import { LoggerModule as PinoLoggerModule } from './service/pino-logger.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'debug',
        genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  messageFormat: '{context} - {msg}',
                },
              }
            : undefined,
        base: { service: 'gymtrack' },
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
        serializers: {
          err: pino.stdSerializers.err,
          req(req) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              headers: {
                'x-request-id': req.headers['x-request-id'],
                'user-agent': req.headers['user-agent'],
              },
            };
          },
          res(res) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        customProps: (req) => ({
          traceId: req.id,
          // biome-ignore lint/suspicious/noExplicitAny: user is added by auth guard
          userId: (req as any).user?.id,
        }),
        autoLogging: true,
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
