import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export const dataSourceOptionsFactory = (
  configService: ConfigService
): PostgresConnectionOptions => {
  return {
    type: 'postgres',
    name: 'identity',
    url: configService.get('database.url'),
    useUTC: true,
    synchronize: false,
    entities: [join(__dirname, 'entity', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migration', '*-migration.{ts,js}')],
    migrationsRun: false,
    migrationsTableName: 'identity_migrations',
    logging: false,
  };
};
