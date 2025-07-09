import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { DataSource } from 'typeorm';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

const getDataSource = async () => {
  const configModule = await NestFactory.createApplicationContext(ConfigModule.forRoot());
  const configService = configModule.get<ConfigService>(ConfigService);

  return new DataSource(dataSourceOptionsFactory(configService));
};

export default getDataSource();
