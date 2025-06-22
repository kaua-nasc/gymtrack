import { faker } from '@faker-js/faker';
import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { Day } from '@src/module/training-plan/persistence/entity/day.entity';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import * as Factory from 'factory.ts';

const day = new Day({
  id: faker.string.uuid(),
  trainingPlanId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: undefined,
});

export const trainingPlanFactory = Factory.Sync.makeFactory<Partial<TrainingPlan>>({
  id: faker.string.uuid(),
  name: faker.string.sample(),
  days: [day],
  level: TrainingPlanLevel.advanced,
  observation: faker.string.sample(),
  pathology: faker.string.sample(),
  timeInDays: faker.number.int(),
  type: TrainingPlanType.hypertrophy,
  authorId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: undefined,
});
