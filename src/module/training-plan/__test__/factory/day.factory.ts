import * as Factory from 'factory.ts';
import { Day } from '../../persistence/entity/day.entity';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const dayFactory = Factory.Sync.makeFactory<Partial<Day>>({
  id: faker.string.uuid(),
  name: faker.string.alphanumeric(),
  trainingPlanId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
