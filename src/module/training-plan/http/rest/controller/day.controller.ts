import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';

@Controller('day')
export class DayController {
  constructor(private readonly dayManagementService: DayManagementService) {}

  @Post()
  async createDay(@Body() contentData: Input): Promise<Output> {
    const createdDay = await this.dayManagementService.createDay({
      trainingPlanId: contentData.trainingPlanId,
      trainings: [],
    });

    return {
      id: createdDay.id,
    };
  }

  @Get('list/:trainingPlanId')
  async getDaysBytrainingPlanId(@Param('trainingPlanId') trainingPlanId: string) {
    const traningPlans = await this.dayManagementService.getDays(trainingPlanId);

    return traningPlans;
  }

  @Get(':dayId')
  async getDayById(@Param('dayId') id: string) {
    const traningPlans = await this.dayManagementService.getDay(id);

    return traningPlans;
  }

  @Delete(':dayId')
  async deleteTrainingPlanById(@Param('dayId') id: string) {
    await this.dayManagementService.deleteOne(id);
  }
}

type Input = {
  trainingPlanId: string;
  name: string;
};

type Output = {
  id: string;
};
