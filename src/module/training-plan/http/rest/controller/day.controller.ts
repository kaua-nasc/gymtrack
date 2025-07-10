import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';
import { CreateDayRequestDto } from '../dto/request/create-day-request.dto';

@Controller('day')
export class DayController {
  constructor(private readonly dayManagementService: DayManagementService) {}

  @Post()
  async create(@Body() user: CreateDayRequestDto) {
    return await this.dayManagementService.create({ ...user });
  }

  @Delete(':dayId')
  async delete(@Param('dayId') id: string) {
    await this.dayManagementService.delete(id);
  }
}
