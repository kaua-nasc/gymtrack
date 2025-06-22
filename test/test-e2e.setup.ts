import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';

export const createNestApp = async (modules: any[] = [AppModule]) => {
  initializeTransactionalContext();
  const module = await Test.createTestingModule({
    imports: modules,
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  return { module, app };
};
