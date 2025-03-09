import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

@Injectable()
export class UpdateTrainingPlanProgressToInProgressUseCase {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository,
    private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  async execute(userId: string, trainingPlanId: string) {
    const trainingPlanProgress =
      await this.trainingPlanProgressRepository.findTrainingPlanProgress(
        userId,
        trainingPlanId
      );

    this.trainingPlanProgressService.setStatusToInProgress(trainingPlanProgress);

    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      trainingPlanProgress
    );
  }
}
