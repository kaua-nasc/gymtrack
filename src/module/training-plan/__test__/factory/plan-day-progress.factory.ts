import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';

export const planDayProgressFactory = Factory.Sync.makeFactory<Partial<PlanDayProgress>>({
  id: faker.string.uuid(),
  planSubscriptionId: faker.string.uuid(),
  dayId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
