import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { WorkoutSessionService } from '@src/module/training-plan/core/service/workout-session.service';
import { LogWorkoutSetRequestDto } from '../dto/request/log-workout-set-request.dto';
import { StartWorkoutSessionRequestDto } from '../dto/request/start-workout-session-request.dto';
import { ActiveWorkoutSessionResponseDto } from '../dto/response/active-workout-session-response.dto';

@ApiTags('Workout Sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('training-plan/session')
export class WorkoutSessionController {
  constructor(private readonly workoutSessionService: WorkoutSessionService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Starts a new workout session or returns the active one' })
  @ApiBody({ type: StartWorkoutSessionRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Session started or retrieved successfully',
    type: ActiveWorkoutSessionResponseDto,
  })
  async startSession(
    @Body() dto: StartWorkoutSessionRequestDto
  ): Promise<ActiveWorkoutSessionResponseDto> {
    return await this.workoutSessionService.startSession(dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Retrieves the current active session for the user' })
  @ApiResponse({
    status: 200,
    description: 'Active session retrieved successfully',
    type: ActiveWorkoutSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No active session found' })
  async getActiveSession(): Promise<ActiveWorkoutSessionResponseDto> {
    return await this.workoutSessionService.getActiveSession();
  }

  @Patch('log-set')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logs a completed set and updates session state' })
  @ApiBody({ type: LogWorkoutSetRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Set logged and session updated',
    type: ActiveWorkoutSessionResponseDto,
  })
  async logSet(
    @Body() dto: LogWorkoutSetRequestDto
  ): Promise<ActiveWorkoutSessionResponseDto> {
    return await this.workoutSessionService.logSet(dto);
  }

  @Post('finish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Concludes the workout session and saves final logs' })
  @ApiResponse({ status: 204, description: 'Session finished successfully' })
  async finishSession(): Promise<void> {
    await this.workoutSessionService.finishSession();
  }

  @Post('cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancels the active workout session' })
  @ApiResponse({ status: 204, description: 'Session cancelled successfully' })
  async cancelSession(): Promise<void> {
    await this.workoutSessionService.cancelSession();
  }
}
