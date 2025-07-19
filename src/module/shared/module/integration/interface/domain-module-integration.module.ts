import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/module/shared/module/config/config.module';
import { HttpClientModule } from '@src/module/shared/module/http-client/http-client.module';
import { TrainingPlanHttpClient } from '@src/module/shared/module/integration/client/training-plan-http.client';
import { IdentityHttpClient } from '../client/identity-http.client';

@Module({
  imports: [ConfigModule.forRoot(), HttpClientModule],
  providers: [TrainingPlanHttpClient, IdentityHttpClient],
  exports: [TrainingPlanHttpClient, IdentityHttpClient],
})
export class DomainModuleIntegrationModule {}
