import { Module } from '@nestjs/common';
import { SubscriptionController } from './http/rest/controller/subscription.controller';
import { SubscriptionService } from './core/service/subscription.service';
import { HttpClientModule } from '@src/shared/module/http-client/http-client.module';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { BillingPublicApiProvider } from './integration/provider/public-api.provider';
import { BillingPersistenceModule } from './persistence/billing-persistence.module';

@Module({
  imports: [BillingPersistenceModule.forRoot(), ConfigModule.forRoot(), HttpClientModule],
  providers: [SubscriptionService, BillingPublicApiProvider],
  controllers: [SubscriptionController],
  exports: [BillingPublicApiProvider],
})
export class BillingModule {}
