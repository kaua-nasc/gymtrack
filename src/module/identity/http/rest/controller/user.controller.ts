import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrainerRelationshipService } from '../../../core/service/trainer-relationship.service';
import { UserFollowsService } from '../../../core/service/user-follows.service';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserMetricsService } from '../../../core/service/user-metrics.service';
import { UserPrivacyService } from '../../../core/service/user-privacy.service';
import { UserCreateRequestDto } from '../dto/request/user-create-request.dto';
import { UserExistsResponseDto } from '../dto/response/user-exists-response.dto';
import { UserFollowCountResponseDto } from '../dto/response/user-follow-count-response.dto';
import { UserPrivacySettingsResponseDto } from '../dto/response/user-privacy-settings-response.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import 'multer';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { ZodBody } from '@src/module/shared/http/decorator/zod-body.decorator';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { Public } from '../../../../shared/module/auth/guard/jwt-auth.guard';
import { AddBodyMeasurementsRequestDto } from '../dto/request/add-body-measurements-request.dto';
import { AddWeightLogRequestDto } from '../dto/request/add-weight-log-request.dto';
import { UpdateTrainerNoteRequestDto } from '../dto/request/update-trainer-note-request.dto';
import { UpdateUserMetricsRequestDto } from '../dto/request/update-user-metrics-request.dto';
import { UpgradeToPersonalTrainerRequestDto } from '../dto/request/upgrade-to-personal-trainer-request.dto';
import { UserChangeBioRequestDto } from '../dto/request/user-change-bio-request.dto';
import { UserGetByIdsRequestDto } from '../dto/request/user-get-by-ids-request.dto';
import { BodyMeasurementResponseDto } from '../dto/response/body-measurement-response.dto';
import { MetricGoalResponseDto } from '../dto/response/metric-goal-response.dto';
import { WeightLogResponseDto } from '../dto/response/weight-log-response.dto';
import {
  type AddBodyMeasurementsRequestSchema,
  type AddWeightLogRequestSchema,
  type CreateMetricGoalRequestSchema,
  type LinkTrainerRequestSchema,
  type UpdateMetricGoalStatusRequestSchema,
  type UpdateTrainerInviteCodeRequestSchema,
  type UpdateTrainerNoteRequestSchema,
  type UpdateUserMetricsRequestSchema,
  type UpgradeToPersonalTrainerRequestSchema,
  type UserChangeBioRequestSchema,
  type UserCreateRequestSchema,
  type UserGetByIdsRequestSchema,
  type UserPrivacySettingsRequestSchema,
} from '../schema/identity-request.schema';
import {
  addBodyMeasurementsRequestSchema,
  addWeightLogRequestSchema,
  createMetricGoalRequestSchema,
  linkTrainerRequestSchema,
  updateMetricGoalStatusRequestSchema,
  updateTrainerInviteCodeRequestSchema,
  updateTrainerNoteRequestSchema,
  updateUserMetricsRequestSchema,
  upgradeToPersonalTrainerRequestSchema,
  userChangeBioRequestSchema,
  userCreateRequestSchema,
  userGetByIdsRequestSchema,
  userPrivacySettingsRequestSchema,
} from '../schema/identity-request.schema';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('identity/user')
export class UserController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly userMetricsService: UserMetricsService,
    private readonly userFollowsService: UserFollowsService,
    private readonly trainerRelationshipService: TrainerRelationshipService,
    private readonly userPrivacyService: UserPrivacyService,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserResponseDto],
  })
  async getAll() {
    return await this.userManagementService.getUsers();
  }

  @Post('by-ids')
  @ApiOperation({ summary: 'Busca múltiplos usuários por IDs' })
  @ApiBody({
    description: 'Lista de IDs dos usuários',
    type: UserGetByIdsRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserByIds(
    @ZodBody(userGetByIdsRequestSchema) data: UserGetByIdsRequestSchema
  ): Promise<UserResponseDto[]> {
    return await this.userManagementService.getUsersByIds(data.userIds);
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description:
      'Cria um novo registro de usuário com nome, e-mail e senha. O e-mail deve ser único no sistema.',
  })
  @ApiBody({ type: UserCreateRequestDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  async createUser(
    @ZodBody(userCreateRequestSchema) user: UserCreateRequestSchema
  ): Promise<void> {
    await this.userManagementService.create({ ...user });
  }

  @Get('exists/:userId')
  @ApiOperation({ summary: 'Verifica se o usuário existe' })
  @ApiParam({ name: 'userId', description: 'ID do usuário a ser verificado' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se o usuário existe',
    schema: { example: { exists: true } },
  })
  async exists(@Param('userId') userId: string): Promise<UserExistsResponseDto> {
    const exists = await this.userManagementService.existsById(userId);
    return { exists: exists };
  }

  @Post('follow/:followedId')
  @ApiOperation({ summary: 'Seguir outro usuário' })
  @ApiParam({ name: 'followedId', description: 'Id do usuário a ser seguido' })
  async followUser(@Param('followedId') followedId: string) {
    await this.userFollowsService.followUser(followedId);
  }

  @Post('unfollow/:followedId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Deixar de seguir outro usuário' })
  @ApiParam({ name: 'followedId', description: 'Id do usuário sendo deixado de seguir' })
  async unfollowUser(@Param('followedId') followedId: string) {
    await this.userFollowsService.unfollowUser(followedId);
  }

  @Get('/:userId/following/count')
  @ApiOperation({ summary: 'Contar quantidade de pessoas seguindo' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, schema: { example: { count: 3 } } })
  async countFollowing(
    @Param('userId') userId: string
  ): Promise<UserFollowCountResponseDto> {
    const count = await this.userFollowsService.countFollowing(userId);
    return { count };
  }

  @Get('/:userId/followers/count')
  @ApiOperation({ summary: 'Contar quantidade de pessoas que seguem o usuario' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, schema: { example: { count: 0 } } })
  async countFollowers(
    @Param('userId') userId: string
  ): Promise<UserFollowCountResponseDto> {
    const count = await this.userFollowsService.countFollowers(userId);
    return { count };
  }

  @Get('/:userId/following')
  @ApiOperation({ summary: 'Retornar usuarios que o usuario segue' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getFollowing(@Param('userId') userId: string): Promise<UserResponseDto[]> {
    return await this.userFollowsService.getFollowing(userId);
  }

  @Get('/:userId/followers')
  @ApiOperation({ summary: 'Retornar usuarios que seguem o usuario' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getFollowers(@Param('userId') userId: string): Promise<UserResponseDto[]> {
    return await this.userFollowsService.getFollowers(userId);
  }

  @Get('privacy/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtém as configurações de privacidade de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Configurações retornadas com sucesso',
    type: UserPrivacySettingsResponseDto,
  })
  async getPrivacyConfiguration(): Promise<UserPrivacySettingsResponseDto> {
    return await this.userPrivacyService.getPrivacyConfiguration();
  }

  @Put('privacy/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Altera as configurações de privacidade de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Configurações de privacidade atualizadas com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async alterPrivacySettings(
    @ZodBody(userPrivacySettingsRequestSchema) createDto: UserPrivacySettingsRequestSchema
  ) {
    await this.userPrivacyService.alterPrivacySettings({ ...createDto });
  }

  @Post('profile/picture')
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

  @Delete('profile/picture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user profile picture' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async removeProfile() {
    await this.userManagementService.removeProfile();
  }

  @Put('profile')
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

  @Patch('profile/metrics')
  @ApiOperation({ summary: 'Update user height, weight and unit preferences' })
  @ApiBody({ type: UpdateUserMetricsRequestDto })
  @ApiResponse({ status: 200, description: 'Metrics updated successfully' })
  async updateMetrics(
    @ZodBody(updateUserMetricsRequestSchema) dto: UpdateUserMetricsRequestSchema
  ): Promise<void> {
    await this.userMetricsService.updateMetrics(dto);
  }

  @Post('profile/upgrade')
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

  @Post('profile/downgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Downgrade user profile to Client' })
  @ApiResponse({ status: 200, description: 'Profile downgraded successfully' })
  async downgradeToClient(): Promise<{ accessToken: string }> {
    return await this.userManagementService.downgradeToClient();
  }

  @Post('profile/weight')
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

  @Get('profile/weight-history')
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

  @Post('profile/measurements')
  @ApiOperation({ summary: 'Add body measurements (bulk)' })
  @ApiBody({ type: AddBodyMeasurementsRequestDto })
  async addBodyMeasurements(
    @ZodBody(addBodyMeasurementsRequestSchema) dto: AddBodyMeasurementsRequestSchema
  ): Promise<BodyMeasurementResponseDto[]> {
    return await this.userMetricsService.addBodyMeasurements(dto);
  }

  @Get('profile/measurements')
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

  @Get('profile/measurements/latest')
  @ApiOperation({ summary: 'Get latest body measurements for all types' })
  async getLatestBodyMeasurements(): Promise<BodyMeasurementResponseDto[]> {
    return await this.userMetricsService.getLatestBodyMeasurements();
  }

  @Post('profile/goals')
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

  @Get('profile/goals')
  @ApiOperation({ summary: 'Get all metric goals' })
  async getMetricGoals(): Promise<MetricGoalResponseDto[]> {
    const goals = await this.userMetricsService.getMetricGoals();
    return goals.map((goal) => ({...goal}));
  }

  @Patch('profile/metrics/goals/:id')
  @ApiOperation({ summary: 'Update a metric goal status' })
  async updateMetricGoalStatus(
    @Param('id') id: string,
    @ZodBody(updateMetricGoalStatusRequestSchema) dto: UpdateMetricGoalStatusRequestSchema
  ): Promise<void> {
    await this.userMetricsService.updateMetricGoalStatus(id, dto);
  }

  @Get('profile/trainer-code')
  @ApiOperation({ summary: 'Get current trainer invite code (Trainer only)' })
  async getTrainerInviteCode(): Promise<{ inviteCode?: string }> {
    return { inviteCode: await this.trainerRelationshipService.getTrainerInviteCode() };
  }

  @Patch('profile/trainer-code')
  @ApiOperation({ summary: 'Update trainer invite code (Trainer only)' })
  async updateTrainerInviteCode(
    @ZodBody(updateTrainerInviteCodeRequestSchema)
    dto: UpdateTrainerInviteCodeRequestSchema
  ): Promise<void> {
    await this.trainerRelationshipService.updateTrainerInviteCode(dto.inviteCode);
  }

  @Post('profile/link-trainer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link to a trainer using invite code (Student only)' })
  async linkTrainer(
    @ZodBody(linkTrainerRequestSchema) dto: LinkTrainerRequestSchema
  ): Promise<void> {
    await this.trainerRelationshipService.linkTrainer(dto.inviteCode);
  }

  @Delete('profile/unlink-trainer')
  @ApiOperation({ summary: 'Unlink from current trainer (Student only)' })
  async unlinkTrainer(): Promise<void> {
    await this.trainerRelationshipService.unlinkTrainer();
  }

  @Delete('profile/unlink-student/:studentId')
  @ApiOperation({ summary: 'Unlink a student (Trainer only)' })
  async unlinkStudent(@Param('studentId') studentId: string): Promise<void> {
    await this.trainerRelationshipService.unlinkStudent(studentId);
  }

  @Get('profile/students')
  @ApiOperation({ summary: 'List all linked students (Trainer only)' })
  async getStudents(): Promise<UserResponseDto[]> {
    return await this.trainerRelationshipService.getStudents();
  }

  @Get('trainer/students/:studentId/metrics/weight')
  @ApiOperation({ summary: 'Get weight history of a linked student (Trainer only)' })
  async getStudentWeightHistory(
    @Param('studentId') studentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return await this.userMetricsService.getStudentWeightHistory(studentId, page, limit);
  }

  @Get('trainer/students/:studentId/metrics/measurements')
  @ApiOperation({
    summary: 'Get measurements history of a linked student (Trainer only)',
  })
  @ApiQuery({ name: 'type', enum: MeasurementType, required: false })
  async getStudentBodyMeasurementsHistory(
    @Param('studentId') studentId: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return await this.userMetricsService.getStudentBodyMeasurementsHistory(
      studentId,
      type as MeasurementType,
      page,
      limit
    );
  }

  @Get('trainer/students/:studentId/metrics/goals')
  @ApiOperation({ summary: 'Get metric goals of a linked student (Trainer only)' })
  async getStudentMetricGoals(@Param('studentId') studentId: string) {
    return await this.userMetricsService.getStudentMetricGoals(studentId);
  }

  @Patch('trainer/weight-log/:id/note')
  @ApiOperation({ summary: 'Update trainer note on a weight log (Trainer only)' })
  @ApiBody({ type: UpdateTrainerNoteRequestDto })
  async updateWeightLogNote(
    @Param('id') id: string,
    @ZodBody(updateTrainerNoteRequestSchema) dto: UpdateTrainerNoteRequestSchema
  ): Promise<void> {
    await this.userMetricsService.addWeightLogNote(id, dto.note);
  }

  @Patch('trainer/body-measurement/:id/note')
  @ApiOperation({ summary: 'Update trainer note on a body measurement (Trainer only)' })
  @ApiBody({ type: UpdateTrainerNoteRequestDto })
  async updateBodyMeasurementNote(
    @Param('id') id: string,
    @ZodBody(updateTrainerNoteRequestSchema) dto: UpdateTrainerNoteRequestSchema
  ): Promise<void> {
    await this.userMetricsService.addBodyMeasurementNote(id, dto.note);
  }

  @Get('profile/trainer')
  @ApiOperation({ summary: 'Get current trainer information (Student only)' })
  async getTrainer(): Promise<UserResponseDto | null> {
    return await this.trainerRelationshipService.getTrainer() ?? null;
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

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userManagementService.getUserById(id);
  }
}
