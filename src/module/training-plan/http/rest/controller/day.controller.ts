import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';
import { CreateDayRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-day-request.dto';

@Controller('day')
export class DayController {
  constructor(private readonly dayManagementService: DayManagementService) {}

  @Post()
  async createDay(@Body() contentData: CreateDayRequestDto): Promise<Output> {
    const createdDay = await this.dayManagementService.createDay({
      ...contentData,
      exercises: [],
    });

    return {
      id: createdDay.id,
    };
  }

  @Put('update/name/:dayId')
  async updateDayName(
    @Param('dayId') dayId: string,
    @Body() contentData: { name: string }
  ) {
    await this.dayManagementService.updateDayName(dayId, { ...contentData });
  }

  @Get('list/:trainingPlanId')
  async getDaysBytrainingPlanId(@Param('trainingPlanId') trainingPlanId: string) {
    const days = await this.dayManagementService.getDays(trainingPlanId);

    return days;
  }

  @Get(':dayId')
  async getDayById(@Param('dayId') id: string) {
    const day = await this.dayManagementService.findDayById(id);

    return day;
  }

  @Delete(':dayId')
  async deleteTrainingPlanById(@Param('dayId') id: string) {
    await this.dayManagementService.deleteDayById(id);
  }

  @Get('get-recursivaly/:trainingPlanId')
  async getDaysRecursivaly(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.dayManagementService.findDaysByTrainingPlanIdRecursivaly(
      trainingPlanId
    );
  }

  @Get('get-one-recursivaly/:dayId')
  async getOneDaysRecursivaly(@Param('dayId') dayId: string) {
    return await this.dayManagementService.findDayRecursivaly(dayId);
  }
}

type Output = {
  id: string;
};
