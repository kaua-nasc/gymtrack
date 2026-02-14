import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { DayManagementService } from '@src/module/training-plan/core/service/day-management.service';
import { CreateDayRequestDto } from '../dto/request/create-day-request.dto';
import { CreateManyDayRequestDto } from '../dto/request/create-many-day-request.dto';

@ApiTags('Days')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('day')
export class DayController {
  constructor(private readonly dayManagementService: DayManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um dia' })
  @ApiBody({ type: CreateDayRequestDto })
  @ApiResponse({ status: 201, description: 'Dia criado com sucesso' })
  async create(@Body() user: CreateDayRequestDto): Promise<void> {
    await this.dayManagementService.create({ ...user });
  }

  @Post('list')
  @ApiOperation({ summary: 'Cria vários dias de uma vez' })
  @ApiBody({ type: [CreateManyDayRequestDto] })
  @ApiResponse({ status: 201, description: 'Dias criados com sucesso' })
  async createMany(@Body() user: CreateManyDayRequestDto[]): Promise<void> {
    await this.dayManagementService.createMany({ ...user });
  }

  @Delete(':dayId')
  @ApiOperation({ summary: 'Deleta um dia pelo ID' })
  @ApiParam({ name: 'dayId', description: 'ID do dia' })
  @ApiResponse({ status: 200, description: 'Dia deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Dia não encontrado' })
  async delete(@Param('dayId') id: string): Promise<void> {
    await this.dayManagementService.delete(id);
  }
}
