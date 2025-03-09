import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/module/persistence/typeorm/typeorm-persistence.module';
import { Plan } from './entity/plan.entity';
import { Subscription } from './entity/subscription.entity';
import { PlanRepository } from './repository/plan.repository';
import { SubscriptionRepository } from './repository/subscription.repository';

@Module({})
export class BillingPersistenceModule {
  static forRoot(): DynamicModule {
    return {
      module: BillingPersistenceModule,
      imports: [TypeOrmPersistenceModule.forFeature([Plan, Subscription])],
      providers: [PlanRepository, SubscriptionRepository],
      exports: [PlanRepository, SubscriptionRepository],
    };
  }
}
