import { Injectable } from '@nestjs/common';
import { UpdateTrainingPlanProgressToCompletedUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-completed.use-case';
import { UpdateTrainingPlanProgressToInProgressUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-in-progress.use-case';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import {
  TrainingPlanCompleteApi,
  TrainingPlanExistsApi,
  TrainingPlanUpdateToInProgressApi,
} from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class TrainingPlanPublicApiProvider
  implements
    TrainingPlanExistsApi,
    TrainingPlanCompleteApi,
    TrainingPlanUpdateToInProgressApi
{
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService,
    private readonly updateTrainingPlanProgressToCompletedUseCase: UpdateTrainingPlanProgressToCompletedUseCase,
    private readonly updateTrainingPlanProgressToInProgressUseCase: UpdateTrainingPlanProgressToInProgressUseCase
  ) {}

  public async updateToInProgressTrainingPlan(
    userId: string,
    trainingPlanId: string
  ): Promise<{ status: boolean }> {
    const result = await this.updateTrainingPlanProgressToInProgressUseCase.execute(
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
    const result = await this.updateTrainingPlanProgressToCompletedUseCase.execute(
      userId,
      trainingPlanId
    );

    return {
      status: result.status == TrainingPlanProgressStatus.completed,
    };
  }
}
