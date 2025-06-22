import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { HttpClientModule } from '@src/module/shared/module/http-client/http-client.module';
import { BillingSubscriptionHttpClient } from '@src/module/shared/module/integration/client/billing-subscription-http.client';
import { TrainingPlanHttpClient } from '@src/module/shared/module/integration/client/training-plan-http.client';

@Module({
  imports: [ConfigModule.forRoot(), HttpClientModule],
  providers: [TrainingPlanHttpClient, BillingSubscriptionHttpClient],
  exports: [TrainingPlanHttpClient, BillingSubscriptionHttpClient],
})
export class DomainModuleIntegrationModule {}
