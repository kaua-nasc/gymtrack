import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { User } from '@src/module/identity/persistence/entity/user.entity';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserCreateRequestDto } from '../dto/request/user-create-request.dto';
import { UserPrivacySettingsRequestDto } from '../dto/request/user-privacy-settings-request.dto';
import { UserExistsResponseDto } from '../dto/response/user-exists-response.dto';
import { UserFollowCountResponseDto } from '../dto/response/user-follow-count-response.dto';
import { UserPrivacySettingsResponseDto } from '../dto/response/user-privacy-settings-response.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';
import 'multer';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { Public } from '../../../../shared/module/auth/guard/jwt-auth.guard';
import { UserGetByIdsRequestDto } from '../dto/request/user-get-by-ids-request.dto';
import { UpdateUserMetricsRequestDto } from '../dto/request/update-user-metrics-request.dto';
import { AddWeightLogRequestDto } from '../dto/request/add-weight-log-request.dto';
import { WeightLogResponseDto } from '../dto/response/weight-log-response.dto';
import { AddBodyMeasurementsRequestDto } from '../dto/request/add-body-measurements-request.dto';
import { BodyMeasurementResponseDto } from '../dto/response/body-measurement-response.dto';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { CreateMetricGoalRequestDto } from '../dto/request/create-metric-goal-request.dto';
import { MetricGoalResponseDto } from '../dto/response/metric-goal-response.dto';
import { UpdateMetricGoalStatusRequestDto } from '../dto/request/update-metric-goal-status-request.dto';
import { UpdateTrainerInviteCodeRequestDto } from '../dto/request/update-trainer-invite-code-request.dto';
import { LinkTrainerRequestDto } from '../dto/request/link-trainer-request.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('identity/user')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserResponseDto],
  })
  async getAll() {
    const users = await this.userManagementService.getUsers();

    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userManagementService.getUserById(id);

    return { ...user };
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
  async getUserByIds(@Body() data: UserGetByIdsRequestDto): Promise<UserResponseDto[]> {
    const users = await this.userManagementService.getUsersByIds(data.userIds);

    return users.map((user) => ({ ...user }));
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo usuário',
    description:
      'Cria um novo registro de usuário com nome, e-mail e senha. O e-mail deve ser único no sistema.',
  })
  @ApiBody({
    type: UserCreateRequestDto,
    description: 'Dados necessários para criar o usuário',
    examples: {
      default: {
        summary: 'Exemplo de criação de usuário',
        value: {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@email.com',
          password: 'Senha@123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    schema: {
      example: {
        id: 'a8216f60-34b3-4b6e-91e0-1a9d93b1a924',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        profilePictureUrl: null,
        bio: null,
        createdAt: '2025-11-08T12:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos — por exemplo, e-mail em formato incorreto ou já existente.',
  })
  async createUser(@Body() user: UserCreateRequestDto): Promise<void> {
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
    await this.userManagementService.followUser(followedId);
  }

  @Post('unfollow/:followedId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Deixar de seguir outro usuário' })
  @ApiParam({ name: 'followedId', description: 'Id do usuário sendo deixado de seguir' })
  async unfollowUser(@Param('followedId') followedId: string) {
    await this.userManagementService.unfollowUser(followedId);
  }

  @Get('/:userId/following/count')
  @ApiOperation({ summary: 'Contar quantidade de pessoas seguindo' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    schema: { example: { count: 3 } },
  })
  async countFollowing(
    @Param('userId') userId: string
  ): Promise<UserFollowCountResponseDto> {
    const count = await this.userManagementService.countFollowing(userId);

    return { count };
  }

  @Get('/:userId/followers/count')
  @ApiOperation({ summary: 'Contar quantidade de pessoas que seguem o usuario' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    schema: { example: { count: 0 } },
  })
  async countFollowers(
    @Param('userId') userId: string
  ): Promise<UserFollowCountResponseDto> {
    const count = await this.userManagementService.countFollowers(userId);

    return { count };
  }

  @Get('/:userId/following')
  @ApiOperation({ summary: 'Retornar usuarios que o usuario segue' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    schema: { example: { count: 0 } },
  })
  async getFollowing(@Param('userId') userId: string): Promise<UserResponseDto[]> {
    const users = await this.userManagementService.getFollowing(userId);

    return users.map((u) => ({ ...u }));
  }

  @Get('/:userId/followers')
  @ApiOperation({ summary: 'Retornar usuarios que seguem o usuario' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    schema: { example: { count: 0 } },
  })
  async getFollowers(@Param('userId') userId: string): Promise<UserResponseDto[]> {
    const users = await this.userManagementService.getFollowers(userId);

    return users.map((u) => ({ ...u }));
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
    const privacyConfiguration =
      await this.userManagementService.getPrivacyConfiguration();
    return { ...privacyConfiguration };
  }

  @Put('privacy/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Altera as configurações de privacidade de um usuário',
    description:
      'Permite atualizar as preferências de privacidade, como exibir nome, e-mail e progresso de treino.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações de privacidade atualizadas com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async alterPrivacySettings(@Body() createDto: UserPrivacySettingsRequestDto) {
    await this.userManagementService.alterPrivacySettings({ ...createDto });
  }

  @Post('profile')
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

  @Delete('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove user profile picture' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async removeProfile() {
    await this.userManagementService.removeProfile();
  }

  @Patch('profile/metrics')
  @ApiOperation({ summary: 'Update user height, weight and unit preferences' })
  @ApiBody({ type: UpdateUserMetricsRequestDto })
  @ApiResponse({ status: 200, description: 'Metrics updated successfully' })
  async updateMetrics(@Body() dto: UpdateUserMetricsRequestDto): Promise<void> {
    await this.userManagementService.updateMetrics(dto);
  }

  @Post('profile/upgrade')
  @ApiOperation({ summary: 'Upgrade user profile to Personal Trainer' })
  @ApiResponse({ status: 200, description: 'Profile upgraded successfully' })
  async upgradeToPersonalTrainer(): Promise<void> {
    await this.userManagementService.upgradeToPersonalTrainer();
  }

  @Post('profile/weight')
  @ApiOperation({ summary: 'Add a new weight log entry' })
  @ApiBody({ type: AddWeightLogRequestDto })
  @ApiResponse({ status: 201, description: 'Weight log entry created successfully', type: WeightLogResponseDto })
  async addWeightLog(@Body() dto: AddWeightLogRequestDto): Promise<WeightLogResponseDto> {
    const log = await this.userManagementService.addWeightLog(dto);
    return {
      id: log.id,
      weight: log.weight,
      measuredAt: log.measuredAt,
    };
  }

  @Get('profile/weight-history')
  @ApiOperation({ summary: 'Get weight history' })
  @ApiResponse({ status: 200, description: 'Weight history retrieved successfully' })
  async getWeightHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<{ items: WeightLogResponseDto[], total: number }> {
    const { items, total } = await this.userManagementService.getWeightHistory(Number(page), Number(limit));
    return {
      items: items.map(log => ({
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
  @ApiResponse({ status: 201, description: 'Measurements added successfully', type: () => [BodyMeasurementResponseDto] })
  async addBodyMeasurements(@Body() dto: AddBodyMeasurementsRequestDto): Promise<BodyMeasurementResponseDto[]> {
    const measurements = await this.userManagementService.addBodyMeasurements(dto);
    return measurements.map(m => ({
      id: m.id,
      type: m.type,
      value: m.value,
      measuredAt: m.measuredAt,
    }));
  }

  @Get('profile/measurements')
  @ApiOperation({ summary: 'Get body measurements history' })
  @ApiQuery({ name: 'type', enum: MeasurementType, enumName: 'MeasurementType', required: false, description: 'Tipo de medida para filtrar o histórico' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  async getBodyMeasurementsHistory(
    @Query('type') type?: MeasurementType,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ): Promise<{ items: BodyMeasurementResponseDto[], total: number }> {
    const { items, total } = await this.userManagementService.getBodyMeasurementsHistory(type, Number(page), Number(limit));
    return {
      items: items.map(m => ({
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
  @ApiResponse({ status: 200, description: 'Latest measurements retrieved successfully', type: [BodyMeasurementResponseDto] })
  async getLatestBodyMeasurements(): Promise<BodyMeasurementResponseDto[]> {
    const measurements = await this.userManagementService.getLatestBodyMeasurements();
    return measurements.map(m => ({
      id: m.id,
      type: m.type,
      value: m.value,
      measuredAt: m.measuredAt,
    }));
  }

  @Post('profile/goals')
  @ApiOperation({ summary: 'Create a new metric goal' })
  @ApiBody({ type: CreateMetricGoalRequestDto })
  @ApiResponse({ status: 201, description: 'Goal created successfully', type: MetricGoalResponseDto })
  async createMetricGoal(@Body() dto: CreateMetricGoalRequestDto): Promise<MetricGoalResponseDto> {
    const goal = await this.userManagementService.createMetricGoal(dto);
    return {
      id: goal.id,
      type: goal.type,
      startingValue: goal.startingValue,
      targetValue: goal.targetValue,
      deadline: goal.deadline,
      status: goal.status,
      progress: 0,
    };
  }

  @Get('profile/goals')
  @ApiOperation({ summary: 'Get all metric goals' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully', type: [MetricGoalResponseDto] })
  async getMetricGoals(): Promise<MetricGoalResponseDto[]> {
    const goals = await this.userManagementService.getMetricGoals();
    return goals.map(goal => ({
      id: goal.id,
      type: goal.type,
      startingValue: goal.startingValue,
      targetValue: goal.targetValue,
      deadline: goal.deadline,
      achievedAt: goal.achievedAt,
      status: goal.status,
      progress: goal.progress,
    }));
  }

  @Patch('profile/metrics/goals/:id')
  @ApiOperation({ summary: 'Update a metric goal status' })
  @ApiParam({ name: 'id', description: 'ID of the goal' })
  @ApiBody({ type: UpdateMetricGoalStatusRequestDto })
  @ApiResponse({ status: 200, description: 'Goal status updated successfully' })
  async updateMetricGoalStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMetricGoalStatusRequestDto
  ): Promise<void> {
    await this.userManagementService.updateMetricGoalStatus(id, dto);
  }

  // --- Trainer & Student Relationship Section ---

  @Get('profile/trainer-code')
  @ApiOperation({ summary: 'Get current trainer invite code (Trainer only)' })
  @ApiResponse({ status: 200, description: 'Current invite code' })
  async getTrainerInviteCode(): Promise<{ inviteCode?: string }> {
    const code = await this.userManagementService.getTrainerInviteCode();
    return { inviteCode: code };
  }

  @Patch('profile/trainer-code')
  @ApiOperation({ summary: 'Update trainer invite code (Trainer only)' })
  @ApiBody({ type: UpdateTrainerInviteCodeRequestDto })
  @ApiResponse({ status: 200, description: 'Invite code updated successfully' })
  async updateTrainerInviteCode(
    @Body() dto: UpdateTrainerInviteCodeRequestDto
  ): Promise<void> {
    await this.userManagementService.updateTrainerInviteCode(dto.inviteCode);
  }

  @Post('profile/link-trainer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link to a trainer using invite code (Student only)' })
  @ApiBody({ type: LinkTrainerRequestDto })
  @ApiResponse({ status: 200, description: 'Linked to trainer successfully' })
  async linkTrainer(@Body() dto: LinkTrainerRequestDto): Promise<void> {
    await this.userManagementService.linkTrainer(dto.inviteCode);
  }

  @Delete('profile/unlink-trainer')
  @ApiOperation({ summary: 'Unlink from current trainer (Student only)' })
  @ApiResponse({ status: 200, description: 'Unlinked successfully' })
  async unlinkTrainer(): Promise<void> {
    await this.userManagementService.unlinkTrainer();
  }

  @Delete('profile/unlink-student/:studentId')
  @ApiOperation({ summary: 'Unlink a student (Trainer only)' })
  @ApiParam({ name: 'studentId', description: 'ID of the student to unlink' })
  @ApiResponse({ status: 200, description: 'Student unlinked successfully' })
  async unlinkStudent(@Param('studentId') studentId: string): Promise<void> {
    await this.userManagementService.unlinkStudent(studentId);
  }

  @Get('profile/students')
  @ApiOperation({ summary: 'List all linked students (Trainer only)' })
  @ApiResponse({ status: 200, description: 'List of students', type: [UserResponseDto] })
  async getStudents(): Promise<UserResponseDto[]> {
    const students = await this.userManagementService.getStudents();
    return students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      bio: s.bio,
      profilePictureUrl: s.profilePictureUrl,
    }));
  }

  @Get('profile/trainer')
  @ApiOperation({ summary: 'Get current trainer information (Student only)' })
  @ApiResponse({ status: 200, description: 'Trainer info', type: UserResponseDto })
  async getTrainer(): Promise<UserResponseDto | null> {
    const trainer = await this.userManagementService.getTrainer();
    if (!trainer) return null;
    return {
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      bio: trainer.bio,
      profilePictureUrl: trainer.profilePictureUrl,
    };
  }

  @Public()
  @Get('student/:studentId/trainer-id')
  @ApiOperation({ summary: 'Get trainer ID of a student (Internal use)' })
  @ApiParam({ name: 'studentId', description: 'ID of the student' })
  @ApiResponse({ status: 200, description: 'Trainer ID' })
  async getTrainerIdByStudentId(
    @Param('studentId') studentId: string
  ): Promise<{ trainerId: string | null }> {
    const trainerId = await this.userManagementService.getTrainerIdByStudentId(studentId);
    return { trainerId };
  }
  }
