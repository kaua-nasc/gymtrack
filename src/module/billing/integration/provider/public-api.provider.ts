import { Injectable } from '@nestjs/common';
import { BillingSubscriptionStatusApi } from '@src/shared/module/integration/interface/billing-integration.interface';
import { SubscriptionService } from '@src/module/billing/core/service/subscription.service';
import { SubscriptionStatus } from '@src/module/billing/core/model/subscription.model';

@Injectable()
export class BillingPublicApiProvider implements BillingSubscriptionStatusApi {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  public async isUserSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await this.subscriptionService.getSubscriptionByUserId(userId);
    return subscription?.status === SubscriptionStatus.Active ? true : false;
  }

  public async subscriptionPlanTrainingPlanQuanity(userId: string): Promise<number> {
    const subscription = await this.subscriptionService.getSubscriptionByUserId(userId);
    return subscription?.Plan?.trainingPlanQuantity ?? 0;
  }
}
