import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';

@Controller('training-plan')
export class TrainingPlanController {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  @Post()
  async createTrainingPlan(@Body() contentData: Input): Promise<Output> {
    const createdTrainingPlan =
      await this.trainingPlanManagementService.createTrainingPlan({
        ...contentData,
      });

    return {
      id: createdTrainingPlan.id,
    };
  }

  @Get('list/:userId')
  async getTrainingPlansByUserId(@Param('userId') userId: string) {
    const traningPlans =
      await this.trainingPlanManagementService.getTrainingPlansByUserId(userId);

    return traningPlans;
  }

  @Get(':trainingPlanId')
  async getTrainingPlanById(@Param('trainingPlanId') trainingPlanId: string) {
    const traningPlans =
      await this.trainingPlanManagementService.getTrainingPlanId(trainingPlanId);

    return traningPlans;
  }

  @Delete(':trainingPlanId')
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string) {
    await this.trainingPlanManagementService.deleteTrainingPlan(id);
  }
}

type Input = {
  name: string;
  userId: string;
  timeInDays: number;
  type: TrainingType;
  observation: string | null;
  pathology: string | null;
  level: TrainingLevel;
};

type Output = {
  id: string;
};
