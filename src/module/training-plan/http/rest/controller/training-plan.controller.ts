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
    return await this.trainingPlanManagementService.create({ ...contentData });
  }

  @Get('list/:authorId')
  async findTrainingPlansByAuthorId(@Param('authorId') authorId: string) {
    return await this.trainingPlanManagementService.list(authorId);
  }

  @Get('lista')
  async findTrainingPlans() {
    return await this.trainingPlanManagementService.lista();
  }

  @Get(':trainingPlanId')
  async findOneTrainingPlanById(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.trainingPlanManagementService.get(trainingPlanId);
  }

  @Get('exists/:trainingPlanId')
  async TrainingPlanExists(@Param('trainingPlanId') trainingPlanId: string) {
    await this.trainingPlanManagementService.get(trainingPlanId);

    return {
      exists: true,
    };
  }

  @Delete(':trainingPlanId')
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string) {
    await this.trainingPlanManagementService.delete(id);
  }
}
