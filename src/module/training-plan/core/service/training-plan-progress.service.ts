import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { TrainingPlanProgressRepository } from '../../persistence/repository/training-plan-progress.repository';

@Injectable()
export class TrainingPlanProgressService {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}
  setStatusToInProgress(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.inProgress;
  }

  setStatusToCompleted(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.completed;
  }

  setStatusToNotStarted(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.notStarted;
  }

  progressCanBeCompleted(trainingPlanProgress: TrainingPlanProgress) {
    if (trainingPlanProgress.status != TrainingPlanProgressStatus.inProgress) {
      throw new DomainException(
        "Training plan progress cannot be completed because it isn't in progress"
      );
    }
  }

  async upgradeTrainingPlanProgressToCompleted(userId: string, trainingPlanId: string) {
    const trainingPlanProgress =
      await this.trainingPlanProgressRepository.findTrainingPlanProgress(
        userId,
        trainingPlanId
      );

    this.progressCanBeCompleted(trainingPlanProgress);

    this.setStatusToCompleted(trainingPlanProgress);

    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      trainingPlanProgress
    );
  }

  async upgradeTrainingPlanProgressToInProgress(userId: string, trainingPlanId: string) {
    const trainingPlanProgress =
      await this.trainingPlanProgressRepository.findTrainingPlanProgress(
        userId,
        trainingPlanId
      );

    this.setStatusToInProgress(trainingPlanProgress);

    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      trainingPlanProgress
    );
  }
}
