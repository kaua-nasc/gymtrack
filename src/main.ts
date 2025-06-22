import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerFactory } from '@src/module/shared/module/logger/util/logger.factory';
import { AppModule } from './app.module';
import { ConfigService } from './module/shared/module/config/service/config.service';

async function bootstrap() {
  const logger = LoggerFactory('appplication-main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');

  const docConfig = new DocumentBuilder().setVersion('1.0').build();
  SwaggerModule.setup('api', app, () => SwaggerModule.createDocument(app, docConfig));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(logger);

  await app.listen(port);

  logger.log({ message: `Application running on port ${port}` });
}

bootstrap();
