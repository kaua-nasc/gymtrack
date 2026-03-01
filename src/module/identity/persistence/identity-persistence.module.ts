import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { UserRepository } from './repository/user.repository';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';
import { CacheModule } from '@src/module/shared/module/cache/cache.module';
import { UserFollowsRepository } from './repository/user-follows.repository';
import { UserPrivacySettingsRepository } from './repository/user-privacy-settings.repository';
import { WeightLogRepository } from './repository/weight-log.repository';
import { BodyMeasurementRepository } from './repository/body-measurement.repository';

@Module({
  imports: [
    CacheModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('cache.host'),
        port: configService.get('cache.port'),
        db: configService.get('cache.db'),
        password: configService.get('cache.password'),
      }),
    }),
    TypeOrmPersistenceModule.forRoot({
      name: 'identity',
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return dataSourceOptionsFactory(configService);
      },
    }),
  ],
  providers: [
    UserRepository,
    UserFollowsRepository,
    UserPrivacySettingsRepository,
    WeightLogRepository,
    BodyMeasurementRepository,
  ],
  exports: [
    UserRepository,
    UserFollowsRepository,
    UserPrivacySettingsRepository,
    WeightLogRepository,
    BodyMeasurementRepository,
  ],
})
export class IdentityPersistenceModule {}
