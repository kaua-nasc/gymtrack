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

  @Get('list')
  async list() {
    return await this.trainingPlanManagementService.list();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrainingPlan(@Body() contentData: CreateTrainingPlanRequestDto) {
    return await this.trainingPlanManagementService.create({ ...contentData });
  }

  @Get('list/:authorId')
  async findTrainingPlansByAuthorId(@Param('authorId') authorId: string) {
    return await this.trainingPlanManagementService.listByUserId(authorId);
  }

  @Get(':trainingPlanId')
  async findOneTrainingPlanById(@Param('trainingPlanId') trainingPlanId: string) {
    return await this.trainingPlanManagementService.get(trainingPlanId);
  }

  @Get('exists/:trainingPlanId')
  async trainingPlanExists(@Param('trainingPlanId') trainingPlanId: string) {
    const user = await this.trainingPlanManagementService.get(trainingPlanId);

    if (!user) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
    };
  }

  @Delete(':trainingPlanId')
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string) {
    await this.trainingPlanManagementService.delete(id);
  }
}
