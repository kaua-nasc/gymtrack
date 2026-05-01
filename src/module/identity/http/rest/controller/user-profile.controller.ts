import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrainerRelationshipService } from '@src/module/identity/core/service/trainer-relationship.service';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { UserMetricsService } from '@src/module/identity/core/service/user-metrics.service';
import {
  JwtAuthGuard,
  Public,
} from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { UserChangeBioRequestDto } from '../dto/request/user-change-bio-request.dto';
import {
  addBodyMeasurementsRequestSchema,
  type AddBodyMeasurementsRequestSchema,
  addWeightLogRequestSchema,
  type AddWeightLogRequestSchema,
  createMetricGoalRequestSchema,
  type CreateMetricGoalRequestSchema,
  linkTrainerRequestSchema,
  type LinkTrainerRequestSchema,
  updateMetricGoalStatusRequestSchema,
  type UpdateMetricGoalStatusRequestSchema,
  updateTrainerInviteCodeRequestSchema,
  type UpdateTrainerInviteCodeRequestSchema,
  type UpdateUserMetricsRequestSchema,
  updateUserMetricsRequestSchema,
  upgradeToPersonalTrainerRequestSchema,
  type UpgradeToPersonalTrainerRequestSchema,
  type UserChangeBioRequestSchema,
  userChangeBioRequestSchema,
} from '../schema/identity-request.schema';
import { ZodBody } from '@src/module/shared/http/decorator/zod-body.decorator';
import { UpdateUserMetricsRequestDto } from '../dto/request/update-user-metrics-request.dto';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { AddBodyMeasurementsRequestDto } from '../dto/request/add-body-measurements-request.dto';
import { AddWeightLogRequestDto } from '../dto/request/add-weight-log-request.dto';
import { UpgradeToPersonalTrainerRequestDto } from '../dto/request/upgrade-to-personal-trainer-request.dto';
import { BodyMeasurementResponseDto } from '../dto/response/body-measurement-response.dto';
import { MetricGoalResponseDto } from '../dto/response/metric-goal-response.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { WeightLogResponseDto } from '../dto/response/weight-log-response.dto';
import { Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('identity/user/profile')
export class UserProfileController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly userMetricsService: UserMetricsService,
    private readonly trainerRelationshipService: TrainerRelationshipService,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  @Post('picture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload user profile picture' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async changeProfile(@UploadedFile() file: Express.Multer.File) {
    await this.userManagementService.changeProfile(file.buffer);
  }

  @Delete('picture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user profile picture' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async removeProfile() {
    await this.userManagementService.removeProfile();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Altera as informações do usuário logado' })
  @ApiBody({ type: UserChangeBioRequestDto })
  @ApiResponse({ status: 200, description: 'Informações alteradas com sucesso' })
  async alterUserInformation(
    @ZodBody(userChangeBioRequestSchema) data: UserChangeBioRequestSchema
  ): Promise<void> {
    const userId = this.request.user.id;
    await this.userManagementService.alterUserInformation(userId, data);
  }

  @Patch('metrics')
  @ApiOperation({ summary: 'Update user height, weight and unit preferences' })
  @ApiBody({ type: UpdateUserMetricsRequestDto })
  @ApiResponse({ status: 200, description: 'Metrics updated successfully' })
  async updateMetrics(
    @ZodBody(updateUserMetricsRequestSchema) dto: UpdateUserMetricsRequestSchema
  ): Promise<void> {
    await this.userMetricsService.updateMetrics(dto);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade user profile to Personal Trainer' })
  @ApiBody({ type: UpgradeToPersonalTrainerRequestDto })
  @ApiResponse({ status: 200, description: 'Profile upgraded successfully' })
  async upgradeToPersonalTrainer(
    @ZodBody(upgradeToPersonalTrainerRequestSchema)
    dto: UpgradeToPersonalTrainerRequestSchema
  ): Promise<{ accessToken: string }> {
    return await this.userManagementService.upgradeToPersonalTrainer(dto.cref);
  }

  @Post('downgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Downgrade user profile to Client' })
  @ApiResponse({ status: 200, description: 'Profile downgraded successfully' })
  async downgradeToClient(): Promise<{ accessToken: string }> {
    return await this.userManagementService.downgradeToClient();
  }

  @Post('weight')
  @ApiOperation({ summary: 'Add a new weight log entry' })
  @ApiBody({ type: AddWeightLogRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Weight log entry created successfully',
    type: WeightLogResponseDto,
  })
  async addWeightLog(
    @ZodBody(addWeightLogRequestSchema) dto: AddWeightLogRequestSchema
  ): Promise<WeightLogResponseDto> {
    return await this.userMetricsService.addWeightLog(dto);
  }

  @Get('weight-history')
  @ApiOperation({ summary: 'Get weight history' })
  async getWeightHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<{ items: WeightLogResponseDto[]; total: number }> {
    const { items, total } = await this.userMetricsService.getWeightHistory(
      Number(page),
      Number(limit)
    );
    return {
      items: items.map((log) => ({
        id: log.id,
        weight: log.weight,
        measuredAt: log.measuredAt,
      })),
      total,
    };
  }

  @Post('measurements')
  @ApiOperation({ summary: 'Add body measurements (bulk)' })
  @ApiBody({ type: AddBodyMeasurementsRequestDto })
  async addBodyMeasurements(
    @ZodBody(addBodyMeasurementsRequestSchema) dto: AddBodyMeasurementsRequestSchema
  ): Promise<BodyMeasurementResponseDto[]> {
    return await this.userMetricsService.addBodyMeasurements(dto);
  }

  @Get('measurements')
  @ApiOperation({ summary: 'Get body measurements history' })
  @ApiQuery({ name: 'type', enum: MeasurementType, required: false })
  async getBodyMeasurementsHistory(
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<{ items: BodyMeasurementResponseDto[]; total: number }> {
    const { items, total } = await this.userMetricsService.getBodyMeasurementsHistory(
      type as MeasurementType,
      Number(page),
      Number(limit)
    );
    return {
      items: items.map((m) => ({
        id: m.id,
        type: m.type,
        value: m.value,
        measuredAt: m.measuredAt,
      })),
      total,
    };
  }

  @Get('measurements/latest')
  @ApiOperation({ summary: 'Get latest body measurements for all types' })
  async getLatestBodyMeasurements(): Promise<BodyMeasurementResponseDto[]> {
    return await this.userMetricsService.getLatestBodyMeasurements();
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a new metric goal' })
  async createMetricGoal(
    @ZodBody(createMetricGoalRequestSchema) dto: CreateMetricGoalRequestSchema
  ): Promise<MetricGoalResponseDto> {
    const goal = await this.userMetricsService.createMetricGoal(dto);
    return {
      ...goal,
      progress: 0,
    };
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get all metric goals' })
  async getMetricGoals(): Promise<MetricGoalResponseDto[]> {
    const goals = await this.userMetricsService.getMetricGoals();
    return goals.map((goal) => ({ ...goal }));
  }

  @Patch('metrics/goals/:id')
  @ApiOperation({ summary: 'Update a metric goal status' })
  async updateMetricGoalStatus(
    @Param('id') id: string,
    @ZodBody(updateMetricGoalStatusRequestSchema) dto: UpdateMetricGoalStatusRequestSchema
  ): Promise<void> {
    await this.userMetricsService.updateMetricGoalStatus(id, dto);
  }

  @Get('trainer-code')
  @ApiOperation({ summary: 'Get current trainer invite code (Trainer only)' })
  async getTrainerInviteCode(): Promise<{ inviteCode?: string }> {
    return { inviteCode: await this.trainerRelationshipService.getTrainerInviteCode() };
  }

  @Patch('trainer-code')
  @ApiOperation({ summary: 'Update trainer invite code (Trainer only)' })
  async updateTrainerInviteCode(
    @ZodBody(updateTrainerInviteCodeRequestSchema)
    dto: UpdateTrainerInviteCodeRequestSchema
  ): Promise<void> {
    await this.trainerRelationshipService.updateTrainerInviteCode(dto.inviteCode);
  }

  @Post('link-trainer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link to a trainer using invite code (Student only)' })
  async linkTrainer(
    @ZodBody(linkTrainerRequestSchema) dto: LinkTrainerRequestSchema
  ): Promise<void> {
    await this.trainerRelationshipService.linkTrainer(dto.inviteCode);
  }

  @Delete('unlink-trainer')
  @ApiOperation({ summary: 'Unlink from current trainer (Student only)' })
  async unlinkTrainer(): Promise<void> {
    await this.trainerRelationshipService.unlinkTrainer();
  }

  @Delete('unlink-student/:studentId')
  @ApiOperation({ summary: 'Unlink a student (Trainer only)' })
  async unlinkStudent(@Param('studentId') studentId: string): Promise<void> {
    await this.trainerRelationshipService.unlinkStudent(studentId);
  }

  @Get('students')
  @ApiOperation({ summary: 'List all linked students (Trainer only)' })
  async getStudents(): Promise<UserResponseDto[]> {
    return await this.trainerRelationshipService.getStudents();
  }

  @Get('trainer')
  @ApiOperation({ summary: 'Get current trainer information (Student only)' })
  async getTrainer(): Promise<UserResponseDto | null> {
    return (await this.trainerRelationshipService.getTrainer()) ?? null;
  }

  @Public()
  @Get('student/:studentId/trainer-id')
  @ApiOperation({ summary: 'Get trainer ID of a student (Internal use)' })
  async getTrainerIdByStudentId(
    @Param('studentId') studentId: string
  ): Promise<{ trainerId: string | null }> {
    const trainerId =
      await this.trainerRelationshipService.getTrainerIdByStudentId(studentId);
    return { trainerId };
  }
}
