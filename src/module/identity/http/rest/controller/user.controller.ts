import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@src/module/identity/application/use-case/create-user.use-case';
import { UpdateUserAddCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-add-current-training-plan.use-case';
import { UpdateUserCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-current-training-plan.use-case';
import { UpdateUserFinishCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-finish-current-training-plan.use-case';
import { CreateUserDto } from '@src/module/identity/http/rest/dto/request/create-user-request.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserCurrentTrainingPlanUseCase: UpdateUserCurrentTrainingPlanUseCase,
    private readonly updateUserFinishCurrentTrainingPlanUseCase: UpdateUserFinishCurrentTrainingPlanUseCase,
    private readonly updateUserAddCurrentTrainingPlanUseCase: UpdateUserAddCurrentTrainingPlanUseCase
  ) {}

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
}
