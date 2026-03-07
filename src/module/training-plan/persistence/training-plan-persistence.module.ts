import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { TypeOrmPersistenceModule } from '@src/module/shared/module/persistence/typeorm/typeorm-persistence.module';
import { DayRepository } from './repository/day.repository';
import { ExerciseRepository } from './repository/exercise.repository';
import { PlanDayProgressRepository } from './repository/plan-day-progress.repository';
import { PlanInviteRepository } from './repository/plan-invite.repository';
import { PlanSubscriptionRepository } from './repository/plan-subscription.repository';
import { TrainingPlanRepository } from './repository/training-plan.repository';
import { TrainingPlanCommentRepository } from './repository/training-plan-comment.repository';
import { TrainingPlanFeedbackRepository } from './repository/training-plan-feedback.repository';
import { TrainingPlanLikeRepository } from './repository/training-plan-like.repository';
import { dataSourceOptionsFactory } from './typeorm-datasource.factory';
import { ExerciseLogRepository } from './repository/exercise-log.repository';
import { ActiveWorkoutSessionRepository } from './repository/active-workout-session.repository';
import { ActiveSetLogRepository } from './repository/active-set-log.repository';

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
        TrainingPlanLikeRepository,
        TrainingPlanCommentRepository,
        PlanInviteRepository,
        ExerciseLogRepository,
        ActiveWorkoutSessionRepository,
        ActiveSetLogRepository,
      ],
      exports: [
        PlanSubscriptionRepository,
        TrainingPlanRepository,
        DayRepository,
        PlanDayProgressRepository,
        TrainingPlanFeedbackRepository,
        ExerciseRepository,
        TrainingPlanLikeRepository,
        TrainingPlanCommentRepository,
        PlanInviteRepository,
        ExerciseLogRepository,
        ActiveWorkoutSessionRepository,
        ActiveSetLogRepository,
      ],
    };
  }
}
