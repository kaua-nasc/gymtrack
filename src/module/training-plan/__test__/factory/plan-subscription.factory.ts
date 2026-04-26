import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { PlanSubscriptionStatus } from '../../core/enum/plan-subscription-status.enum';
import { PlanSubscriptionType } from '../../core/enum/plan-subscription-type.enum';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';

export const planSubscriptionFactory = Factory.Sync.makeFactory<
  Partial<PlanSubscription>
>({
  id: Factory.each(() => faker.string.uuid()),
  status: Factory.each(() => faker.helpers.enumValue(PlanSubscriptionStatus)),
  type: Factory.each(() => faker.helpers.enumValue(PlanSubscriptionType)),
  userId: Factory.each(() => faker.string.uuid()),
  trainingPlanId: Factory.each(() => faker.string.uuid()),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
