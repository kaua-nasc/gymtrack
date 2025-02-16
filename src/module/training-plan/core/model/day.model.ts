import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { randomUUID } from 'crypto';
import { ExerciseModel } from './exercise.model';

export class DayModel extends DefaultModel {
  name: string;
  trainingPlanId: string;
  exercises: ExerciseModel[];

  private constructor(data: DayModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<DayModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): DayModel {
    return new DayModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : undefined,
    });
  }

  static createFrom(data: DayModel) {
    return new DayModel(data);
  }
}
