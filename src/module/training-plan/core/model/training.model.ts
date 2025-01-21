import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { randomUUID } from 'crypto';
import { ExerciseModel } from './exercise.model';

export class TrainingModel extends DefaultModel {
  name: string;
  dayId: string;
  exercises: ExerciseModel[];

  private constructor(data: TrainingModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<TrainingModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): TrainingModel {
    return new TrainingModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : null,
    });
  }

  static createFrom(data: TrainingModel) {
    return new TrainingModel(data);
  }
}
