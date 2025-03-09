import { Controller, Param, Put } from '@nestjs/common';
import { UpdateTrainingPlanProgressToCompletedUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-completed.use-case';
import { UpdateTrainingPlanProgressToInProgressUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-in-progress.use-case';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';

@Controller('training-plan/progress')
export class TrainingPlanProgressController {
  constructor(
    private readonly updateTrainingPlanProgressToCompletedUseCase: UpdateTrainingPlanProgressToCompletedUseCase,
    private readonly updateTrainingPlanProgressToInProgressUseCase: UpdateTrainingPlanProgressToInProgressUseCase
  ) {}

  @Put('/complete/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToCompleted(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    const result = await this.updateTrainingPlanProgressToCompletedUseCase.execute(
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
    const result = await this.updateTrainingPlanProgressToInProgressUseCase.execute(
      userId,
      trainingPlanId
    );

    return { status: result.status == TrainingPlanProgressStatus.inProgress };
  }
}
