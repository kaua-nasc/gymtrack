import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';

import { randomUUID } from 'crypto';
import { SubscriptionModel } from './subscription.model';

export enum PlanInterval {
  Month = 'MONTH',
  Year = 'YEAR',
}
export class PlanModel extends DefaultModel {
  name: string;
  description?: string | null;
  amount: string;
  currency: string;
  interval: PlanInterval;
  trialPeriod: number | null = null;
  trainingPlanQuantity: number;
  Subscriptions?: SubscriptionModel[];

  private constructor(data: PlanModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<PlanModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): PlanModel {
    return new PlanModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : null,
    });
  }

  static createFrom(data: PlanModel): PlanModel {
    return new PlanModel(data);
  }
}
