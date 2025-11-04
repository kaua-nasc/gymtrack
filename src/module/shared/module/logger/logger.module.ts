import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { LoggerModule as PinoLoggerModule } from './service/pino-logger2.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'debug',
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        base: { service: 'gymtrack' },
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
