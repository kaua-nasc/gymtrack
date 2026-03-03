import { Module } from '@nestjs/common';
import { CacheModule } from '@src/module/shared/module/cache/cache.module';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { BodyMeasurementRepository } from './repository/body-measurement.repository';
import { MetricGoalRepository } from './repository/metric-goal.repository';
import { UserRepository } from './repository/user.repository';
import { UserFollowsRepository } from './repository/user-follows.repository';
import { UserPrivacySettingsRepository } from './repository/user-privacy-settings.repository';
import { WeightLogRepository } from './repository/weight-log.repository';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';

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
    MetricGoalRepository,
  ],
  exports: [
    UserRepository,
    UserFollowsRepository,
    UserPrivacySettingsRepository,
    WeightLogRepository,
    BodyMeasurementRepository,
    MetricGoalRepository,
  ],
})
export class IdentityPersistenceModule {}
