import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { ExerciseLogService } from '@src/module/training-plan/core/service/exercise-log.service';
import { CreateExerciseLogRequestDto } from '../dto/request/create-exercise-log-request.dto';
import { ExerciseLog } from '@src/module/training-plan/persistence/entity/exercise-log.entity';
import { WeeklyActivityResponseDto } from '../dto/response/weekly-activity-response.dto';

@ApiTags('Exercise Log')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('exercise-log')
export class ExerciseLogController {
  constructor(private readonly exerciseLogService: ExerciseLogService) {}

  @Post()
  @ApiOperation({ summary: 'Log a completed exercise' })
  @ApiResponse({
    status: 201,
    description: 'The log has been successfully created.',
    type: ExerciseLog,
  })
  async createLog(
    @Body() createExerciseLogDto: CreateExerciseLogRequestDto,
  ): Promise<ExerciseLog> {
    return this.exerciseLogService.createLog(createExerciseLogDto);
  }

  @Get('history/:userId/:exerciseId')
  @ApiOperation({ summary: 'Get the log history for a user and exercise' })
  @ApiResponse({
    status: 200,
    description: 'An array of exercise logs.',
    type: [ExerciseLog],
  })
  async getLogHistory(
    @Param('userId') userId: string,
    @Param('exerciseId') exerciseId: string,
  ): Promise<ExerciseLog[]> {
    return this.exerciseLogService.getLogsForUserAndExercise(userId, exerciseId);
  }

  @Get('activity/weekly')
  @ApiOperation({ summary: 'Get the weekly training activity for a user' })
  @ApiResponse({
    status: 200,
    description: 'The weekly activity status.',
    type: WeeklyActivityResponseDto,
  })
  async getWeeklyActivity(
  ): Promise<WeeklyActivityResponseDto> {
    return this.exerciseLogService.getWeeklyActivity();
  }
}
