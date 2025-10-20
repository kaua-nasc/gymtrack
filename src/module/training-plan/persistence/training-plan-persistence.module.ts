import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { TrainingPlanRepository } from './repository/training-plan.repository';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';
import { PlanSubscriptionRepository } from './repository/plan-subscription.repository';
import { DayRepository } from './repository/day.repository';
import { PlanDayProgressRepository } from './repository/plan-day-progress.repository';
import { ExerciseRepository } from './repository/exercise.repository';
import { TrainingPlanFeedbackRepository } from './repository/training-plan-feedback.repository';

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
        PlanDayProgressRepository,
        ExerciseRepository,
        TrainingPlanFeedbackRepository,
        // TrainingPlanProgressRepository,
      ],
      exports: [
        PlanSubscriptionRepository,
        TrainingPlanRepository,
        DayRepository,
        PlanDayProgressRepository,
        // DayRepository,
        TrainingPlanFeedbackRepository,
        ExerciseRepository,
        //TrainingPlanProgressRepository,
      ],
    };
  }
}
