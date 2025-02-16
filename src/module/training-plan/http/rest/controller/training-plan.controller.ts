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
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';

@Controller('training-plan')
export class TrainingPlanController {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrainingPlan(@Body() contentData: CreateTrainingPlanRequestDto) {
    const created = await this.trainingPlanManagementService.createTrainingPlan({
      ...contentData,
    });

    return {
      id: created.id,
    };
  }

  @Get('list/:authorId')
  async findTrainingPlansByAuthorId(@Param('authorId') authorId: string) {
    const traningPlans =
      await this.trainingPlanManagementService.findTrainingPlansByAuthorId(authorId);

    return traningPlans;
  }

  @Get(':trainingPlanId')
  async findOneTrainingPlanById(@Param('trainingPlanId') trainingPlanId: string) {
    const traningPlans =
      await this.trainingPlanManagementService.findOneTrainingPlanById(trainingPlanId);

    return traningPlans;
  }

  @Delete(':trainingPlanId')
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string) {
    await this.trainingPlanManagementService.deleteTrainingPlan(id);
  }
}
