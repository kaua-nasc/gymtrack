import { NestFactory } from '@nestjs/core';
import { LoggerFactory } from '@src/module/shared/module/logger/util/logger.factory';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();
  const logger = LoggerFactory('appplication-main');
  const app = await NestFactory.create(AppModule);

  app.useLogger(logger);
  await app.listen(3000);
}
bootstrap();
