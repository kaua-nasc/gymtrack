import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggerFactory } from '@src/shared/module/logger/util/logger.factory';
import { AppModule } from './app.module';
import { ConfigService } from './shared/module/config/service/config.service';

async function bootstrap() {
  const logger = LoggerFactory('appplication-main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(logger);

  await app.listen(port);

  logger.log({ message: `Application running on port ${port}` });
}

bootstrap();
