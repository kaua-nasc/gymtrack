import { Body, Controller, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CreateTrainingPlanProgressUseCase } from '@src/module/training-plan/application/use-case/create-training-plan-progress.use-case';
import { UpdateTrainingPlanProgressToCompletedUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-completed.use-case';
import { UpdateTrainingPlanProgressToInProgressUseCase } from '@src/module/training-plan/application/use-case/update-training-plan-progress-to-in-progress.use-case';
import { CreateTrainingPlanProgressRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-progress-request.dto';

@Controller('training-plan/progress')
export class TrainingPlanProgressController {
  constructor(
    private readonly createTrainingPlanProgressUseCase: CreateTrainingPlanProgressUseCase,
    private readonly updateTrainingPlanProgressToCompletedUseCase: UpdateTrainingPlanProgressToCompletedUseCase,
    private readonly updateTrainingPlanProgressToInProgressUseCase: UpdateTrainingPlanProgressToInProgressUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrainingPlanProgress(
    @Body() contentData: CreateTrainingPlanProgressRequestDto
  ) {
    const created = await this.createTrainingPlanProgressUseCase.execute({
      ...contentData,
    });

    return {
      userId: created.userId,
      trainingPlanId: created.trainingPlanId,
      status: created.status,
    };
  }

  @Put('/complete/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToCompleted(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.updateTrainingPlanProgressToCompletedUseCase.execute(
      userId,
      trainingPlanId
    );
  }

  @Put('/in-progress/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToInProgress(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.updateTrainingPlanProgressToInProgressUseCase.execute(
      userId,
      trainingPlanId
    );
  }
}
