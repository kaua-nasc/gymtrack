import * as Factory from 'factory.ts';
import { faker } from '@faker-js/faker/.';
import { Exercise } from '../../persistence/entity/exercise.entity';
import { ExerciseType } from '../../core/enum/exercise-type.enum';

export const trainingPlanFactory = Factory.Sync.makeFactory<Partial<Exercise>>({
  id: faker.string.uuid(),
  name: faker.string.alphanumeric(),
  dayId: faker.string.uuid(),
  type: faker.helpers.enumValue(ExerciseType),
  description: faker.string.alphanumeric(),
  observation: faker.string.alphanumeric(),
  repsNumber: faker.number.int(),
  setsNumber: faker.number.int(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
