import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './module/shared/module/logger/service/app-logger.service';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('GymTrack API').setVersion('1.0').build();
  app.enableCors();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useLogger(app.get(AppLogger));
  await app.listen(3000);
}
bootstrap();
