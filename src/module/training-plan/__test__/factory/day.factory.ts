import * as Factory from 'factory.ts';
import { faker } from '@faker-js/faker';
import { Day } from '../../persistence/entity/day.entity';

export const dayFactory = Factory.Sync.makeFactory<Partial<Day>>({
  id: faker.string.uuid(),
  name: faker.string.alphanumeric(),
  trainingPlanId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
