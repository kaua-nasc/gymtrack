import * as Factory from 'factory.ts';
import { ExerciseLog } from '../../persistence/entity/exercise-log.entity';
import { faker } from '@faker-js/faker';

export const exerciseLogFactory = Factory.Sync.makeFactory<Partial<ExerciseLog>>({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  exerciseId: faker.string.uuid(),
  reps: [10, 10, 10],
  weight: [50, 50, 50],
  notes: faker.lorem.sentence(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
