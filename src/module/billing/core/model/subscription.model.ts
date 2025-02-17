import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { randomUUID } from 'crypto';
import { PlanModel } from './plan.model';

export enum SubscriptionStatus {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
}
export class SubscriptionModel extends DefaultModel {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date | null;
  autoRenew = true;
  Plan?: PlanModel;

  private constructor(data: SubscriptionModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<SubscriptionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): SubscriptionModel {
    return new SubscriptionModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : undefined,
    });
  }

  static createFrom(data: SubscriptionModel): SubscriptionModel {
    return new SubscriptionModel(data);
  }
}
