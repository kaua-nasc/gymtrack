import { NestFactory } from '@nestjs/core';
import { LoggerFactory } from '@src/module/shared/module/logger/util/logger.factory';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  initializeTransactionalContext();
  const logger = LoggerFactory('appplication-main');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('GymTrack API').setVersion('1.0').build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useLogger(logger);
  await app.listen(3000);
}
bootstrap();
