import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';

type Override = { provide: any; useValue: any } | { provide: any; useClass: any };

export const createNestApp = async (
  modules: any[] = [AppModule],
  overrides: Override[] = []
) => {
  initializeTransactionalContext();

  const builder = Test.createTestingModule({ imports: modules });

  for (const override of overrides) {
    if ('useValue' in override) {
      builder.overrideProvider(override.provide).useValue(override.useValue);
    } else if ('useClass' in override) {
      builder.overrideProvider(override.provide).useClass(override.useClass);
    }
  }

  const module = await builder.compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();

  return { module, app };
};
