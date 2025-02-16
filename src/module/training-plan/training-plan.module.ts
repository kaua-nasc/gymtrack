import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { DayManagementService } from './core/service/day-management.service';
import { ExerciseManagementService } from './core/service/exercise-management.service';
import { TrainingManagementService } from './core/service/training-management.service';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { TrainingPlanProgressService } from './core/service/training-plan-progress.service';
import { DayController } from './http/rest/controller/day.controller';
import { ExerciseController } from './http/rest/controller/exercise.controller';
import { TrainingPlanProgressController } from './http/rest/controller/training-plan-progress.controller';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { TrainingController } from './http/rest/controller/training.controller';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TrainingPlanPersistenceModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    TrainingManagementService,
    DayManagementService,
    TrainingPlanManagementService,
    ExerciseManagementService,
    TrainingPlanProgressService,
    TrainingPlanPublicApiProvider,
  ],
  controllers: [
    TrainingPlanController,
    DayController,
    TrainingController,
    ExerciseController,
    TrainingPlanProgressController,
  ],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
