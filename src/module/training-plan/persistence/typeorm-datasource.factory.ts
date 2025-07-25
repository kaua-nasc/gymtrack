import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dataSourceOptionsFactory = (
  configService: ConfigService
): PostgresConnectionOptions => {
  return {
    type: 'postgres',
    name: 'training-plan',
    host: configService.get('database.host'),
    port: 5432,
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    synchronize: false,
    entities: [join(__dirname, 'entity', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migration', '*-migration.{ts,js}')],
    migrationsRun: false,
    migrationsTableName: 'training_plan_migrations',
    logging: false,
  };
};
