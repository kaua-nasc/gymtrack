import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';

@Injectable()
export class TrainingPlanProgressService {
  setStatusToInProgress(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.inProgress;
  }

  setStatusToCompleted(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.completed;
  }

  setStatusToNotStarted(trainingPlanProgress: TrainingPlanProgress) {
    trainingPlanProgress.status = TrainingPlanProgressStatus.notStarted;
  }
}
