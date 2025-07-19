import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserManagementService } from '../../../core/service/user-management.service';
import { UserCreateRequestDto } from '../dto/request/user-create-request.dto';

@Controller('identity/user')
export class UserController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userManagementService.getUserById(id);
  }

  @Post()
  async createUser(@Body() user: UserCreateRequestDto) {
    return await this.userManagementService.create({ ...user });
  }
  @Get('exists/:userId')
  async exists(@Param('userId') userId: string) {
    const exists = await this.userManagementService.exists(userId);

    return { exists };
  }
}
