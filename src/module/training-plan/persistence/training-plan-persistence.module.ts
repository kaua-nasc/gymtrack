import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { TrainingPlanRepository } from './repository/training-plan.repository';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';
import { PlanSubscriptionRepository } from './repository/plan-subscription.repository';
import { DayRepository } from './repository/day.repository';

@Module({})
export class TrainingPlanPersistenceModule {
  static forRoot(): DynamicModule {
    return {
      module: TrainingPlanPersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          name: 'training-plan',
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return dataSourceOptionsFactory(configService);
          },
        }),
      ],
      providers: [
        PlanSubscriptionRepository,
        TrainingPlanRepository,
        DayRepository,
        // ExerciseRepository,
        // TrainingPlanProgressRepository,
      ],
      exports: [
        PlanSubscriptionRepository,
        TrainingPlanRepository,
        DayRepository,
        // DayRepository,
        // ExerciseRepository,
        //TrainingPlanProgressRepository,
      ],
    };
  }
}
