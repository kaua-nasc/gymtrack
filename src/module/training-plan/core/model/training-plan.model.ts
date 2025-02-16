import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { DefaultModel, WithOptional } from '@src/shared/core/model/default.model';
import { randomUUID } from 'crypto';

export class TrainingPlanModel extends DefaultModel {
  name: string;
  authorId: string;
  lastUpdatedBy?: string;
  timeInDays: number;
  type: TrainingPlanType;
  visibility: TrainingPlanVisibility;
  observation?: string;
  pathology?: string;
  level: TrainingPlanLevel;

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
      updatedAt: data.updatedAt ? data.updatedAt : undefined,
      deletedAt: data.deletedAt ? data.deletedAt : undefined,
    });
  }

  static createFrom(data: TrainingPlanModel) {
    return new TrainingPlanModel(data);
  }
}
