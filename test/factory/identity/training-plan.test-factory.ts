import { faker } from '@faker-js/faker/.';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingModel } from '@src/module/training-plan/core/model/training.model';
import * as Factory from 'factory.ts';

const exercise = ExerciseModel.create({
  id: faker.string.uuid(),
  description: faker.string.sample(),
  name: faker.string.sample(),
  observation: faker.string.sample(),
  repsNumber: faker.number.int(),
  setsNumber: faker.number.int(),
  type: ExerciseType.cardio,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});

const training = TrainingModel.create({
  id: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
  title: faker.string.sample(),
  exercises: [exercise],
});

const day = DayModel.create({
  id: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
  trainings: [training],
});

export const trainingPlanFactory = Factory.Sync.makeFactory<TrainingPlanModel>({
  id: faker.string.uuid(),
  name: faker.string.sample(),
  days: [day],
  level: TrainingLevel.advanced,
  observation: faker.string.sample(),
  pathology: faker.string.sample(),
  timeInDays: faker.number.int(),
  type: TrainingType.hypertrophy,
  userId: faker.string.uuid(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  deletedAt: null,
});
