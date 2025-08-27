import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserCreateRequestDto } from '../dto/request/user-create-request.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@src/module/identity/persistence/entity/user.entity';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { UserExistsResponseDto } from '../dto/response/user-exists-response.dto';

@ApiTags('Users')
@Controller('identity/user')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

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
}
