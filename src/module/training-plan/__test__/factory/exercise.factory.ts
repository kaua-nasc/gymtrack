import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { ExerciseType } from '../../core/enum/exercise-type.enum';
import { Exercise } from '../../persistence/entity/exercise.entity';

export const exerciseFactory = Factory.Sync.makeFactory<Partial<Exercise>>({
  id: Factory.each(() => faker.string.uuid()),
  name: Factory.each(() => faker.string.alphanumeric()),
  dayId: Factory.each(() => faker.string.uuid()),
  type: Factory.each(() => faker.helpers.enumValue(ExerciseType)),
  description: Factory.each(() => faker.string.alphanumeric()),
  observation: Factory.each(() => faker.string.alphanumeric()),
  repsNumber: Factory.each(() => faker.number.int({ min: 1, max: 100 })),
  setsNumber: Factory.each(() => faker.number.int({ min: 1, max: 10 })),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
