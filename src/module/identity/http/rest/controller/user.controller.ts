import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserCreateRequestDto } from '../dto/request/user-create-request.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@src/module/identity/persistence/entity/user.entity';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { UserExistsResponseDto } from '../dto/response/user-exists-response.dto';
import { UserFollowCountResponseDto } from '../dto/response/user-follow-count-response.dto';

@ApiTags('Users')
@Controller('identity/user')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  async getAll() {
    const users = await this.userManagementService.getUsers();

    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userManagementService.getUserById(id);

    return { ...user };
  }

  @Post()
  @ApiBody({ type: UserCreateRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createUser(@Body() user: UserCreateRequestDto): Promise<void> {
    await this.userManagementService.create({ ...user });
  }

  @Get('exists/:userId')
  @ApiOperation({ summary: 'Verifica se o usuário existe' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se o usuário existe',
    schema: { example: { exists: true } },
  })
  async exists(@Param('userId') userId: string): Promise<UserExistsResponseDto> {
    const exists = await this.userManagementService.exists(userId);

    return { exists: exists };
  }

  @Post('follow/:userId/:followedId')
  @ApiOperation({ summary: 'Seguir outro usuário' })
  @ApiParam({ name: 'userId', description: 'Id do usuário' })
  @ApiParam({ name: 'followedId', description: 'Id do usuário a ser seguido' })
  async followUser(
    @Param('userId') userId: string,
    @Param('followedId') followedId: string
  ) {
    await this.userManagementService.followUser(userId, followedId);
  }

  @Post('unfollow/:userId/:followedId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Deixar de seguir outro usuário' })
  @ApiParam({ name: 'userId', description: 'Id do usuário' })
  @ApiParam({ name: 'followedId', description: 'Id do usuário sendo deixado de seguir' })
  async unfollowUser(
    @Param('userId') userId: string,
    @Param('followedId') followedId: string
  ) {
    await this.userManagementService.unfollowUser(userId, followedId);
  }

  @Get('following/:userId/count')
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

  @Get('followers/:userId/count')
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

  @Get('following/:userId')
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

  @Get('followers/:userId')
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
}
