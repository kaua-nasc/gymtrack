import { Body, Controller } from '@nestjs/common';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { CreateTrainingPlanReqeustDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan.dto';

@Controller('training-plan')
export class TrainingPlanController {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  async createTrainingPlan(@Body() contentData: CreateTrainingPlanReqeustDto) {
    const createdTrainingPlan =
      await this.trainingPlanManagementService.createTrainingPlan({
        ...contentData,
        days: [],
      });

    return createdTrainingPlan;
  }
}
