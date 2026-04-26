import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { TrainingPlanLevel } from '../../core/enum/training-plan-level.enum';
import { TrainingPlanType } from '../../core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '../../core/enum/training-plan-visibility.enum';
import { PlanParticipant } from '../../persistence/entity/plan-participant.entity';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { TrainingPlanLike } from '../../persistence/entity/training-plan-like.entity';

export const trainingPlanFactory = Factory.Sync.makeFactory<Partial<TrainingPlan>>({
  id: Factory.each(() => faker.string.uuid()),
  authorId: Factory.each(() => faker.string.uuid()),
  level: Factory.each(() => faker.helpers.enumValue(TrainingPlanLevel)),
  name: Factory.each(() => faker.string.alphanumeric()),
  observation: Factory.each(() => faker.string.alphanumeric()),
  pathology: Factory.each(() => faker.string.alphanumeric()),
  timeInDays: Factory.each(() => faker.number.int({ max: 255 })),
  type: Factory.each(() => faker.helpers.enumValue(TrainingPlanType)),
  visibility: Factory.each(() => faker.helpers.enumValue(TrainingPlanVisibility)),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  maxSubscriptions: Factory.each(() => faker.number.int({ min: 1, max: 255 })),
});

export const planParticipantFactory = Factory.Sync.makeFactory<Partial<PlanParticipant>>({
  id: Factory.each(() => faker.string.uuid()),
  approved_at: Factory.each(() => faker.date.past({ years: 1 })),
  trainingPlanId: Factory.each(() => faker.string.uuid()),
  userId: Factory.each(() => faker.string.uuid()),
  expiration_date: Factory.each(() => faker.date.future({ years: 1 })),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});

export const trainingPlanLikeFactory = Factory.Sync.makeFactory<
  Partial<TrainingPlanLike>
>({
  id: Factory.each(() => faker.string.uuid()),
  likedBy: Factory.each(() => faker.string.uuid()),
  trainingPlanId: Factory.each(() => faker.string.uuid()),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
});
