import * as Factory from 'factory.ts';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { faker } from '@faker-js/faker';
import { TrainingPlanLevel } from '../../core/enum/training-plan-level.enum';
import { TrainingPlanType } from '../../core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '../../core/enum/training-plan-visibility.enum';

export const trainingPlanFactory = Factory.Sync.makeFactory<Partial<TrainingPlan>>({
  id: faker.string.uuid(),
  authorId: faker.string.uuid(),
  level: faker.helpers.enumValue(TrainingPlanLevel),
  name: faker.string.alphanumeric(),
  observation: faker.string.alphanumeric(),
  pathology: faker.string.alphanumeric(),
  timeInDays: faker.number.int({ max: 255 }),
  type: faker.helpers.enumValue(TrainingPlanType),
  visibility: faker.helpers.enumValue(TrainingPlanVisibility),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
