import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

@Injectable()
export class UpdateTrainingPlanProgressToInProgressUseCase {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}

  async execute(userId: string, trainingPlanId: string) {
    return await this.trainingPlanProgressRepository.updateTrainingPlanProgressStatus({
      userId,
      trainingPlanId,
      newStatus: TrainingPlanProgressStatus.inProgress,
    });
  }
}
