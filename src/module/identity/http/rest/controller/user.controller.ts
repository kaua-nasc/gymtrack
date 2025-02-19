import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CreateUserUseCase } from '@src/module/identity/application/use-case/create-user.use-case';
import { UpdateUserCurrentTrainingPlanUseCase } from '@src/module/identity/application/use-case/update-user-current-training-plan.use-case';
import { CreateUserDto } from '@src/module/identity/http/rest/dto/request/create-user-request.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserCurrentTrainingPlanUseCase: UpdateUserCurrentTrainingPlanUseCase
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
}
