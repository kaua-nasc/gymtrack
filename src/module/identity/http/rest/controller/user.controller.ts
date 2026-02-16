import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userManagementService.getUserById(id);

    return { ...user };
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

  @Get('exists')
  @ApiOperation({ summary: 'Verifica se o usuário existe' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se o usuário existe',
    schema: { example: { exists: true } },
  })
  async exists(): Promise<UserExistsResponseDto> {
    const exists = await this.userManagementService.exists();

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
}
