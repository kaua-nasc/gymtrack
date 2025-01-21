import { Module } from '@nestjs/common';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { TrainingPlanHttpClient } from '@src/shared/module/integration/client/training-plan-http.client';
import { BillingSubscriptionHttpClient } from '@src/shared/module/integration/client/billing-subscription-http.client';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule.forRoot(), HttpClientModule],
  providers: [TrainingPlanHttpClient, BillingSubscriptionHttpClient],
  exports: [TrainingPlanHttpClient, BillingSubscriptionHttpClient],
})
export class DomainModuleIntegrationModule {}
