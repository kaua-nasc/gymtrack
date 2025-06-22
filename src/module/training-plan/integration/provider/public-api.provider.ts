import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import {
  TrainingPlanCompleteApi,
  TrainingPlanExistsApi,
  TrainingPlanUpdateToInProgressApi,
} from '@src/module/shared/module/integration/interface/training-plan-integration.interface';
import { TrainingPlanProgressService } from '../../core/service/training-plan-progress.service';

@Injectable()
export class TrainingPlanPublicApiProvider
  implements
    TrainingPlanExistsApi,
    TrainingPlanCompleteApi,
    TrainingPlanUpdateToInProgressApi
{
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService,
    private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  public async updateToInProgressTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }> {
    const result =
      await this.trainingPlanProgressService.upgradeTrainingPlanProgressToInProgress(
        userId,
        trainingPlanId
      );

    return {
      status: result.status == TrainingPlanProgressStatus.completed,
    };
  }

  public async traningPlanExists(trainingPlanId: string): Promise<boolean> {
    return await this.trainingPlanManagementService.traningPlanExists(trainingPlanId);
  }

  public async completeTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }> {
    const result =
      await this.trainingPlanProgressService.upgradeTrainingPlanProgressToCompleted(
        userId,
        trainingPlanId
      );

    return {
      status: result.status == TrainingPlanProgressStatus.completed,
    };
  }
}
