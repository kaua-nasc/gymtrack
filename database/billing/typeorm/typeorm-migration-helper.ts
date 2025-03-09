import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@src/shared/module/config/service/config.service';
import { TypeOrmMigrationService } from '@src/shared/module/persistence/typeorm/service/typeorm-migration.service';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { DataSourceOptions } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';

const createDatabaseModule = async () => {
  return await NestFactory.createApplicationContext(
    TypeOrmPersistenceModule.forRoot({
      migrations: [__dirname + '/migration/*'],
    })
  );
};

export const migrate = async () => {
  const migrationModule = await createDatabaseModule();
  migrationModule.init();
  const configService = migrationModule.get<ConfigService>(ConfigService);
  const options = {
    type: 'postgres',
    ...configService.get('database'),
  } as DataSourceOptions;
  await createPostgresDatabase({
    ifNotExist: true,
    options,
  });
  await migrationModule.get(TypeOrmMigrationService).migrate();
};

export const getDataSource = async () => {
  const migrationModule = await createDatabaseModule();
  return migrationModule.get(TypeOrmMigrationService).getDataSource();
};
