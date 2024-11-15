import { Injectable } from '@nestjs/common';

import { NotFoundDomainException } from '@src/shared/core/exception/not-found-domain.exception';
import { PlanRepository } from '@src/module/billing/persistence/repository/plan.repository';
import { SubscriptionRepository } from '@src/module/billing/persistence/repository/subscription.repository';
import {
  SubscriptionModel,
  SubscriptionStatus,
} from '@src/module/billing/core/model/subscription.model';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async createSubscription({ planId }: { planId: string }): Promise<SubscriptionModel> {
    const plan = await this.planRepository.findOneBy({ id: planId });
    if (!plan) {
      throw new NotFoundDomainException(`Plan with id ${planId} not found`);
    }
    const subscription = SubscriptionModel.create({
      planId,
      //TODO replace with user id from the JWT
      userId: 'user-id',
      status: SubscriptionStatus.Active,
      startDate: new Date(),
      autoRenew: true,
    });
    this.subscriptionRepository.create({ ...subscription });
    return subscription;
  }

  async getSubscriptionByUserId(userId: string): Promise<SubscriptionModel | null> {
    return await this.subscriptionRepository.findByUserId(userId);
  }
}
