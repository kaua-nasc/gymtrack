import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { HttpClientModule } from '@src/module/shared/module/http-client/http-client.module';
import { AuthModule } from '../shared/module/auth/auth.module';
import { EmailModule } from '../shared/module/email/email.module';
import { IdentityHttpClient } from '../shared/module/integration/client/identity-http.client';
import { DomainModuleIntegrationModule } from '../shared/module/integration/interface/domain-module-integration.module';
import { IdentityUserExistsApi } from '../shared/module/integration/interface/identity-integration.interface';
import { StorageModule } from '../shared/module/storage/storage.module';
import { DayManagementService } from './core/service/day-management.service';
import { ExerciseLogService } from './core/service/exercise-log.service';
import { ExerciseManagementService } from './core/service/exercise-management.service';
import { PlanInviteManagementService } from './core/service/plan-invite-management.service';
import { PlanSubscriptionManagementService } from './core/service/plan-subscription-management.service';
import { TrainingPlanCommentService } from './core/service/training-plan-comment.service';
import { TrainingPlanFeedbackService } from './core/service/training-plan-feedback.service';
import { TrainingPlanLikeService } from './core/service/training-plan-like.service';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { WorkoutSessionService } from './core/service/workout-session.service';
import { DayController } from './http/rest/controller/day.controller';
import { ExerciseController } from './http/rest/controller/exercise.controller';
import { ExerciseLogController } from './http/rest/controller/exercise-log.controller';
import { PlanInviteController } from './http/rest/controller/plan-invite.controller';
import { PlanSubscriptionController } from './http/rest/controller/plan-subscription.controller';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { WorkoutSessionController } from './http/rest/controller/workout-session.controller';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TrainingPlanPersistenceModule.forRoot(),
    DomainModuleIntegrationModule,
    HttpClientModule,
    StorageModule,
    AuthModule,
    EmailModule,
  ],
  providers: [
    TrainingPlanManagementService,
    TrainingPlanFeedbackService,
    TrainingPlanLikeService,
    TrainingPlanCommentService,
    PlanSubscriptionManagementService,
    DayManagementService,
    ExerciseManagementService,
    PlanInviteManagementService,
    TrainingPlanPublicApiProvider,
    ExerciseLogService,
    WorkoutSessionService,
    {
      provide: IdentityUserExistsApi,
      useExisting: IdentityHttpClient,
    },
  ],
  controllers: [
    PlanSubscriptionController,
    TrainingPlanController,
    DayController,
    ExerciseController,
    ExerciseLogController,
    PlanInviteController,
    WorkoutSessionController,
  ],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
