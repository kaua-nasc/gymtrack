import { Controller, Delete, Get, Param } from '@nestjs/common';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';

@Controller('day')
export class DayController {
  constructor(private readonly dayManagementService: DayManagementService) {}

  @Get('list/:trainingPlanId')
  async getDaysBytrainingPlanId(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.dayManagementService.list(trainingPlanId);
  }

  @Get('list/recursivaly/:trainingPlanId')
  async getDaysRecursivaly(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.dayManagementService.list(trainingPlanId, true);
  }

  @Get(':dayId')
  async getDayById(@Param('dayId') dayId: string) {
    return await this.dayManagementService.get(dayId);
  }

  @Get('recursivaly/:dayId')
  async getOneDaysRecursivaly(@Param('dayId') dayId: string) {
    return await this.dayManagementService.get(dayId, true);
  }

  @Delete(':dayId')
  async deleteTrainingPlanById(@Param('dayId') id: string) {
    await this.dayManagementService.delete(id);
  }
}
