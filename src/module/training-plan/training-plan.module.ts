import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { HttpClientModule } from '@src/module/shared/module/http-client/http-client.module';
import { TrainingPlanManagementService } from './core/service/training-plan-management.service';
import { TrainingPlanController } from './http/rest/controller/training-plan.controller';
import { TrainingPlanPersistenceModule } from './persistence/training-plan-persistence.module';
import { TrainingPlanPublicApiProvider } from './integration/provider/public-api.provider';
import { IdentityUserExistsApi } from '../shared/module/integration/interface/identity-integration.interface';
import { IdentityHttpClient } from '../shared/module/integration/client/identity-http.client';
import { DomainModuleIntegrationModule } from '../shared/module/integration/interface/domain-module-integration.module';
import { PlanSubscriptionController } from './http/rest/controller/plan-subscription.controller';
import { PlanSubscriptionManagementService } from './core/service/plan-subscription-management.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TrainingPlanPersistenceModule.forRoot(),
    DomainModuleIntegrationModule,
    HttpClientModule,
  ],
  providers: [
    TrainingPlanManagementService,
    PlanSubscriptionManagementService,
    TrainingPlanPublicApiProvider,
    {
      provide: IdentityUserExistsApi,
      useExisting: IdentityHttpClient,
    },
  ],
  controllers: [TrainingPlanController, PlanSubscriptionController],
  exports: [TrainingPlanPublicApiProvider],
})
export class TrainingPlanModule {}
