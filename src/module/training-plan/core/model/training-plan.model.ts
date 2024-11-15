import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { DayModel } from './day.model';
import { randomUUID } from 'crypto';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';

export class TrainingPlanModel extends DefaultModel {
  name: string;
  days: DayModel[];
  userId: string;
  timeInDays: number;
  type: TrainingType;
  observation: string | null;
  pathology: string | null;
  level: TrainingLevel;

  private constructor(data: TrainingPlanModel) {
    super();
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<TrainingPlanModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): TrainingPlanModel {
    return new TrainingPlanModel({
      ...data,
      id: data.id ? data.id : randomUUID(),
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : new Date(),
      deletedAt: data.deletedAt ? data.deletedAt : null,
    });
  }

  static createFrom(data: TrainingPlanModel) {
    return new TrainingPlanModel(data);
  }
}
