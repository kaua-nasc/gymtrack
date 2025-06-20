import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@src/module/identity/application/use-case/create-user.use-case';
import { GetUserUseCase } from '@src/module/identity/application/use-case/get-user.use-case';
import { UpdateUserAddCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-add-current-training-plan.use-case';
import { UpdateUserCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-current-training-plan.use-case';
import { UpdateUserFinishCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-finish-current-training-plan.use-case';
import { UpdateUserUseCase } from '@src/module/identity/application/use-case/update-user.use-case';
import { AuthService } from '@src/module/identity/core/service/authentication.service';
import { CreateUserDto } from '@src/module/identity/http/rest/dto/request/create-user-request.dto';
import { LoginUserRequestDto } from '@src/module/identity/http/rest/dto/request/login-user-request.dto';
import { LoginUserResponseDto } from '@src/module/identity/http/rest/dto/response/login-user-response.dto';
import { UpdateUserDto } from '../dto/request/update-user-request.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserCurrentTrainingPlanUseCase: UpdateUserCurrentTrainingPlanUseCase,
    private readonly updateUserFinishCurrentTrainingPlanUseCase: UpdateUserFinishCurrentTrainingPlanUseCase,
    private readonly updateUserAddCurrentTrainingPlanUseCase: UpdateUserAddCurrentTrainingPlanUseCase,
    private readonly authService: AuthService
  ) {}

  @Get('/:userId')
  async get(@Param('userId') userId: string) {
    return this.getUserUseCase.execute(userId);
  }

  @Put('/:userId')
  async update(@Param('userId') userId: string, @Body() data: UpdateUserDto) {
    console.log(data);
    return this.updateUserUseCase.execute(userId, { ...data });
  }

  @Post()
  async create(@Body() contentData: CreateUserDto) {
    return this.createUserUseCase.execute(contentData);
  }

  @Patch('/:userId/:trainingPlanId')
  async updateUserCurrentTrainingPlan(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.updateUserCurrentTrainingPlanUseCase.execute(userId, trainingPlanId);
  }

  @Post('/finish-current-training-plan/:userId')
  async finishCurrentTrainingPlan(@Param('userId') userId: string) {
    await this.updateUserFinishCurrentTrainingPlanUseCase.execute(userId);
  }

  @Post('/add-current-training-plan/:userId/:trainingPlanId')
  async addCurrentTrainingPlan(
    @Param('userId') userId: string,
    @Param('trainingPlanId') trainingPlanId: string
  ) {
    await this.updateUserAddCurrentTrainingPlanUseCase.execute(userId, trainingPlanId);
  }

  @Post('/login')
  async login(@Body() login: LoginUserRequestDto) {
    const res = await this.authService.signIn(login.username, login.password);
    return new LoginUserResponseDto(res.accessToken);
  }
}
