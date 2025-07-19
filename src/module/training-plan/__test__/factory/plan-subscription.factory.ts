import * as Factory from 'factory.ts';
import { faker } from '@faker-js/faker';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';
import { PlanSubscriptionStatus } from '../../core/enum/plan-subscription-status.enum';

export const planSubscriptionFactory = Factory.Sync.makeFactory<
  Partial<PlanSubscription>
>({
  id: faker.string.uuid(),
  status: faker.helpers.enumValue(PlanSubscriptionStatus),
  userId: faker.string.uuid(),
  trainingPlanId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
