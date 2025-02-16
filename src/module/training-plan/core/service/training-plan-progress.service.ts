import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgressModel } from '@src/module/training-plan/core/model/training-plan-progress.model';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

export interface CreateTrainingPlanProgressData {
  userId: string;
  trainingPlanId: string;
}

@Injectable()
export class TrainingPlanProgressService {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}

  async createTrainingPlanProgress(data: CreateTrainingPlanProgressData) {
    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      TrainingPlanProgressModel.create({
        ...data,
        status: TrainingPlanProgressStatus.notStarted,
      })
    );
  }

  async updateTrainingPlanProgressToInProgress(userId: string, trainingPlanId: string) {
    await this.trainingPlanProgressRepository.updateTrainingPlanProgressStatus({
      userId,
      trainingPlanId,
      newStatus: TrainingPlanProgressStatus.inProgress,
    });

    return { userId, trainingPlanId, status: TrainingPlanProgressStatus.inProgress };
  }

  async updateTrainingPlanProgressToCompleted(userId: string, trainingPlanId: string) {
    await this.trainingPlanProgressRepository.updateTrainingPlanProgressStatus({
      userId,
      trainingPlanId,
      newStatus: TrainingPlanProgressStatus.completed,
    });
    return { userId, trainingPlanId, status: TrainingPlanProgressStatus.completed };
  }

  async findTrainingPlanProgress(userId: string, trainingPlanId: string) {
    return await this.trainingPlanProgressRepository.findTrainingPlanProgress(
      userId,
      trainingPlanId
    );
  }
}
