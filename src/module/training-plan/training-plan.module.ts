import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { CreateDayUseCase } from './application/use-case/create-day.use-case';
import { CreateExerciseUseCase } from './application/use-case/create-exercise.use-case';
import { CreateTrainingPlanProgressUseCase } from './application/use-case/create-training-plan-progress.use-case';
import { CreateTrainingPlanUseCase } from './application/use-case/create-training-plan.use-case';
import { DeleteDayUseCase } from './application/use-case/delete-day.use-case';
import { DeleteExerciseUseCase } from './application/use-case/delete-exercise.use-case';
import { DeleteTrainingPlanUseCase } from './application/use-case/delete-training-plan.use-case';
import { GetDayUseCase } from './application/use-case/get-day.use-case';
import { GetExerciseUseCase } from './application/use-case/get-exercise.use-case';
import { GetTrainingPlanUseCase } from './application/use-case/get-training-plan.use-case';
import { LisDayUseCase } from './application/use-case/list-day.use-case';
import { ListExerciseUseCase } from './application/use-case/list-exercise.use-case';
import { ListTrainingPlanUseCase } from './application/use-case/list-training-plan.use-case';
import { UpdateTrainingPlanProgressToCompletedUseCase } from './application/use-case/update-training-plan-progress-to-completed.use-case';
import { UpdateTrainingPlanProgressToInProgressUseCase } from './application/use-case/update-training-plan-progress-to-in-progress.use-case';
import { DayManagementService } from './core/service/day-management.service';
import { ExerciseManagementService } from './core/service/exercise-management.service';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { TrainingPlanProgressService } from './core/service/training-plan-progress.service';
import { DayController } from './http/rest/controller/day.controller';
import { ExerciseController } from './http/rest/controller/exercise.controller';
import { TrainingPlanProgressController } from './http/rest/controller/training-plan-progress.controller';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TrainingPlanPersistenceModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    CreateDayUseCase,
    CreateExerciseUseCase,
    CreateTrainingPlanUseCase,
    CreateTrainingPlanProgressUseCase,
    DeleteDayUseCase,
    DeleteExerciseUseCase,
    DeleteTrainingPlanUseCase,
    GetDayUseCase,
    GetExerciseUseCase,
    GetTrainingPlanUseCase,
    LisDayUseCase,
    ListExerciseUseCase,
    ListTrainingPlanUseCase,
    UpdateTrainingPlanProgressToInProgressUseCase,
    UpdateTrainingPlanProgressToCompletedUseCase,
    DayManagementService,
    TrainingPlanManagementService,
    ExerciseManagementService,
    TrainingPlanProgressService,
    TrainingPlanPublicApiProvider,
  ],
  controllers: [
    TrainingPlanController,
    DayController,
    ExerciseController,
    TrainingPlanProgressController,
  ],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
