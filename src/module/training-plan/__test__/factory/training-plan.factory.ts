import * as Factory from 'factory.ts';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { faker } from '@faker-js/faker';
import { TrainingPlanLevel } from '../../core/enum/training-plan-level.enum';
import { TrainingPlanType } from '../../core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '../../core/enum/training-plan-visibility.enum';
import { PlanParticipant } from '../../persistence/entity/plan-participant.entity';
import { TrainingPlanLike } from '../../persistence/entity/training-plan-like.entity';

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
  maxSubscriptions: faker.number.int({ min: 1, max: 255 }),
});

export const planParticipantFactory = Factory.Sync.makeFactory<Partial<PlanParticipant>>({
  id: faker.string.uuid(),
  approved_at: faker.date.past({ years: 1 }),
  trainingPlanId: faker.string.uuid(),
  userId: faker.string.uuid(),
  expiration_date: faker.date.future({ years: 1 }),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

export const trainingPlanLikeFactory = Factory.Sync.makeFactory<
  Partial<TrainingPlanLike>
>({
  id: faker.string.uuid(),
  likedBy: faker.string.uuid(),
  trainingPlanId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
