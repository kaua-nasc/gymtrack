import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTrainingPlanUseCase } from '@src/module/training-plan/application/use-case/create-training-plan.use-case';
import { DeleteTrainingPlanUseCase } from '@src/module/training-plan/application/use-case/delete-training-plan.use-case';
import { GetTrainingPlanUseCase } from '@src/module/training-plan/application/use-case/get-training-plan.use-case';
import { ListTrainingPlanUseCase } from '@src/module/training-plan/application/use-case/list-training-plan.use-case';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';

@Controller('training-plan')
export class TrainingPlanController {
  constructor(
    private readonly listTrainingPlanUseCase: ListTrainingPlanUseCase,
    private readonly createTrainingPlanUseCase: CreateTrainingPlanUseCase,
    private readonly getTrainingPlanUseCase: GetTrainingPlanUseCase,
    private readonly deleteTrainignPlanUseCase: DeleteTrainingPlanUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrainingPlan(@Body() contentData: CreateTrainingPlanRequestDto) {
    return await this.createTrainingPlanUseCase.execute({ ...contentData });
  }

  @Get('list/:authorId')
  async findTrainingPlansByAuthorId(@Param('authorId') authorId: string) {
    return await this.listTrainingPlanUseCase.execute(authorId);
  }

  @Get(':trainingPlanId')
  async findOneTrainingPlanById(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.getTrainingPlanUseCase.execute(trainingPlanId);
  }

  @Get('exists/:trainingPlanId')
  async TrainingPlanExists(@Param('trainingPlanId') trainingPlanId: string) {
    await this.getTrainingPlanUseCase.execute(trainingPlanId);

    return {
      exists: true,
    };
  }

  @Delete(':trainingPlanId')
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string) {
    await this.deleteTrainignPlanUseCase.execute(id);
  }
}
