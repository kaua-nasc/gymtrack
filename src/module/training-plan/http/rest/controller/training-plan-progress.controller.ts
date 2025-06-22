import { Controller, Param, Put } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';

@Controller('training-plan/progress')
export class TrainingPlanProgressController {
  constructor(
    private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  @Put('/complete/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToCompleted(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    const result =
      await this.trainingPlanProgressService.upgradeTrainingPlanProgressToCompleted(
        userId,
        trainingPlanId
      );

    return { status: result.status == TrainingPlanProgressStatus.completed };
  }

  @Put('/in-progress/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToInProgress(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    const result =
      await this.trainingPlanProgressService.upgradeTrainingPlanProgressToInProgress(
        userId,
        trainingPlanId
      );

    return { status: result.status == TrainingPlanProgressStatus.inProgress };
  }
}
