import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { randomUUID } from 'crypto';

export class ExerciseModel extends DefaultModel {
  dayId: string;
  name: string;
  type: ExerciseType;
  setsNumber: number;
  repsNumber: number;
  description?: string;
  observation?: string;

  private constructor(data: ExerciseModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<ExerciseModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): ExerciseModel {
    return new ExerciseModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : undefined,
    });
  }

  static createFrom(data: ExerciseModel) {
    return new ExerciseModel(data);
  }
}
