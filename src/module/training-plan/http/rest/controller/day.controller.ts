import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateDayUseCase } from '@src/module/training-plan/application/use-case/create-day.use-case';
import { DeleteDayUseCase } from '@src/module/training-plan/application/use-case/delete-day.use-case';
import { GetDayUseCase } from '@src/module/training-plan/application/use-case/get-day.use-case';
import { LisDayUseCase } from '@src/module/training-plan/application/use-case/list-day.use-case';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';
import { CreateDayRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-day-request.dto';

@Controller('day')
export class DayController {
  constructor(
    private readonly dayManagementService: DayManagementService,
    private readonly createDayUseCase: CreateDayUseCase,
    private readonly listDayUseCase: LisDayUseCase,
    private readonly getDayUseCase: GetDayUseCase,
    private readonly deleteDayUseCase: DeleteDayUseCase
  ) {}

  @Post()
  async createDay(@Body() contentData: CreateDayRequestDto): Promise<Output> {
    return await this.createDayUseCase.execute({
      ...contentData,
    });
  }

  @Get('list/:trainingPlanId')
  async getDaysBytrainingPlanId(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.listDayUseCase.execute(trainingPlanId);
  }

  @Get('list/recursivaly/:trainingPlanId')
  async getDaysRecursivaly(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.listDayUseCase.execute(trainingPlanId, true);
  }

  @Get(':dayId')
  async getDayById(@Param('dayId') dayId: string) {
    return await this.getDayUseCase.execute(dayId);
  }

  @Get('recursivaly/:dayId')
  async getOneDaysRecursivaly(@Param('dayId') dayId: string) {
    return await this.getDayUseCase.execute(dayId, true);
  }

  @Delete(':dayId')
  async deleteTrainingPlanById(@Param('dayId') id: string) {
    await this.deleteDayUseCase.execute(id);
  }
}

type Output = {
  id: string;
};
