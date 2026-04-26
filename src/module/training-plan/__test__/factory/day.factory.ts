import { faker } from '@faker-js/faker/locale/pt_BR';
import * as Factory from 'factory.ts';
import { Day } from '../../persistence/entity/day.entity';

export const dayFactory = Factory.Sync.makeFactory<Partial<Day>>({
  id: Factory.each(() => faker.string.uuid()),
  name: Factory.each(() => faker.string.alphanumeric()),
  trainingPlanId: Factory.each(() => faker.string.uuid()),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
