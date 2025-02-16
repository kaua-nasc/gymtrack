import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { CreateTrainingPlanProgressRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-progress-request.dto';

@Controller('training-plan/progress')
export class TrainingPlanProgressController {
  constructor(
    private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrainingPlanProgress(
    @Body() contentData: CreateTrainingPlanProgressRequestDto
  ) {
    const created =
      await this.trainingPlanProgressService.createTrainingPlanProgress(contentData);

    return {
      userId: created.userId,
      trainingPlanId: created.trainingPlanId,
      status: created.status,
    };
  }

  @Get(':userId/:trainingPlanId')
  async findTrainingPlanProgress(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    return await this.trainingPlanProgressService.findTrainingPlanProgress(
      userId,
      trainingPlanId
    );
  }

  @Put('/complete/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToCompleted(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.trainingPlanProgressService.updateTrainingPlanProgressToCompleted(
      userId,
      trainingPlanId
    );
  }

  @Put('/in-progress/:userId/:trainingPlanId')
  async updateTrainingPlanProgressToInProgress(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.trainingPlanProgressService.updateTrainingPlanProgressToInProgress(
      userId,
      trainingPlanId
    );
  }
}
