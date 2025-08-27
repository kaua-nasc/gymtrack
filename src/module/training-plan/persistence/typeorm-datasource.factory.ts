import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dataSourceOptionsFactory = (
  configService: ConfigService
): PostgresConnectionOptions => {
  return {
    type: 'postgres',
    name: 'training-plan',
    url: configService.get('database.url'),
    synchronize: false,
    entities: [join(__dirname, 'entity', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migration', '*-migration.{ts,js}')],
    migrationsRun: false,
    migrationsTableName: 'training_plan_migrations',
    logging: false,
  };
};
