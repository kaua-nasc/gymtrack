import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { UserGetByIdsRequestDto } from '../dto/request/user-get-by-ids-request.dto';
import {
  type UserCreateRequestSchema,
  type UserGetByIdsRequestSchema,
  type UserPrivacySettingsRequestSchema,
} from '../schema/identity-request.schema';
import {
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
    private readonly userPrivacyService: UserPrivacyService
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

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userManagementService.getUserById(id);
  }
}
