import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';

export const planDayProgressFactory = Factory.Sync.makeFactory<Partial<PlanDayProgress>>({
  id: Factory.each(() => faker.string.uuid()),
  planSubscriptionId: Factory.each(() => faker.string.uuid()),
  dayId: Factory.each(() => faker.string.uuid()),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
