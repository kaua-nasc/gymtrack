import { NestFactory } from '@nestjs/core';
import { TypeOrmMigrationService } from '@src/module/shared/module/persistence/typeorm/service/typeorm-migration.service';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';

const createDatabaseModule = async () => {
  return await NestFactory.createApplicationContext(
    TypeOrmPersistenceModule.forRoot({
      migrations: [__dirname + '/migrations/*'],
    })
  );
};

export const getDataSource = async () => {
  const migrationModule = await createDatabaseModule();
  return migrationModule.get(TypeOrmMigrationService).getDataSource();
};
