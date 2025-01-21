import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TrainingManagementService } from '@src/module/training-plan/core/service/training-management.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingManagementService: TrainingManagementService) {}

  @Post()
  async createTraining(@Body() contentData: Input): Promise<Output> {
    const createTraining = await this.trainingManagementService.createTraining({
      ...contentData,
    });

    return { id: createTraining.id };
  }

  @Get('list/:dayId')
  async getTrainingsByDayId(@Param('dayId') dayId: string) {
    const traningPlans = await this.trainingManagementService.getTrainings(dayId);

    return traningPlans;
  }

  @Get(':dayId')
  async getTrainingById(@Param('dayId') id: string) {
    const traningPlans = await this.trainingManagementService.getTrainingById(id);

    return traningPlans;
  }

  @Delete(':dayId')
  async deleteDayById(@Param('dayId') id: string) {
    await this.trainingManagementService.deleteOne(id);
  }
}

type Input = {
  dayId: string;
  name: string;
};

type Output = {
  id: string;
};
