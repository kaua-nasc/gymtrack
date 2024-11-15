import { Inject, Injectable } from '@nestjs/common';
import { BillingSubscriptionStatusApi } from '@src/shared/module/integration/interface/billing-integration.interface';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';

class Plan {
  trainingPlanQuantity: number;
}

class BillingSubscription {
  public userId: string;
  public status: string;
  public plan: Plan;
}

@Injectable()
export class BillingSubscriptionRepository
  extends DefaultTypeOrmRepository<BillingSubscription>
  implements BillingSubscriptionStatusApi
{
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(BillingSubscription, dataSource);
  }
  async isUserSubscriptionActive(userId: string): Promise<boolean> {
    try {
      const subscription = await this.findOneBy({
        userId: userId,
        status: 'ACTIVE',
      });
      return !!subscription;
    } catch {
      throw new Error();
    }
  }

  async subscriptionPlanTrainingPlanQuanity(userId: string): Promise<number> {
    try {
      const subscription = await this.findOneBy({
        userId: userId,
        status: 'ACTIVE',
      });
      return subscription?.plan.trainingPlanQuantity ?? 0;
    } catch {
      throw new Error();
    }
  }
}
