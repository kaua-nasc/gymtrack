import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { HttpClientModule } from '@src/module/shared/module/http-client/http-client.module';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TrainingPlanPersistenceModule.forRoot(),
    HttpClientModule,
  ],
  providers: [
    // DayManagementService,
    TrainingPlanManagementService,
    // ExerciseManagementService,
    // TrainingPlanProgressService,
    TrainingPlanPublicApiProvider,
  ],
  controllers: [
    TrainingPlanController,
    // DayController,
    // ExerciseController,
    // TrainingPlanProgressController,
  ],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
