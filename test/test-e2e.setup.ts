import type { DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { GlobalHttpExceptionFilter } from '@src/module/shared/http/filter/global-http-exception.filter';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { EmailModule } from '@src/module/shared/module/email/email.module';
import { LoggerModule } from '@src/module/shared/module/logger/logger.module';
import { StorageModule } from '@src/module/shared/module/storage/storage.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { MockEmailModule } from './mock/email.mock';
import { MockLoggerModule } from './mock/logger.mock';
import { MockStorageModule } from './mock/storage.mock';
import { configureMswServer } from './msw.setup';
import { getTestConfig } from './test.setup';

type Override =
  | { provide: unknown; useValue: unknown }
  | { provide: unknown; useClass: unknown };

export const createNestApp = async (
  modules: unknown[] = [AppModule],
  overrides: Override[] = []
) => {
  const configuration = getTestConfig();
  const server = configureMswServer();

  const builder = Test.createTestingModule({
    imports: [LoggerModule, ...(modules as DynamicModule[])],
  });

  builder.overrideModule(LoggerModule).useModule(MockLoggerModule);
  builder.overrideModule(StorageModule).useModule(MockStorageModule);
  builder.overrideModule(EmailModule).useModule(MockEmailModule);

  builder.overrideProvider(ConfigService).useValue({
    get: (key: string) => configuration[key],
  });

  for (const override of overrides) {
    if ('useValue' in override) {
      builder.overrideProvider(override.provide).useValue(override.useValue);
    } else if ('useClass' in override) {
      builder.overrideProvider(override.provide).useClass(override.useClass);
    }
  }

  const module = await builder.compile();

  const app = module.createNestApplication({
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  return { module, app, configuration, server };
};
