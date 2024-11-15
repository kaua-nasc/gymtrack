import { Module } from '@nestjs/common';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';

@Module({
  imports: [
    TrainingPlanPersistenceModule.forRoot(),
    ConfigModule.forRoot(),
    HttpClientModule,
  ],
  providers: [TrainingPlanManagementService, TrainingPlanPublicApiProvider],
  controllers: [TrainingPlanController],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
