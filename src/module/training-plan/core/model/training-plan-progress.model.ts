import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { WithOptional } from '@src/shared/core/model/default.model';

export class TrainingPlanProgressModel {
  userId: string;
  trainingPlanId: string;
  status: TrainingPlanProgressStatus;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: TrainingPlanProgressModel) {
    Object.assign(this, data);
  }

  static create(
    data: WithOptional<TrainingPlanProgressModel, 'createdAt' | 'updatedAt' | 'deletedAt'>
  ) {
    return new TrainingPlanProgressModel({
      ...data,
      status: data.status ? data.status : TrainingPlanProgressStatus.notStarted,
      createdAt: data.createdAt ? data.createdAt : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt : undefined,
      deletedAt: data.deletedAt ? data.deletedAt : undefined,
    });
  }
}
