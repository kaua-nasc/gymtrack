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
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlanExistsResponseDto } from '../dto/response/training-plan-exists-response.dto';
import { TrainingPlanResponseDto } from '../dto/response/training-plan-response.dto';

@ApiTags('Training Plans')
@Controller('training-plan')
export class TrainingPlanController {
  constructor(
    private readonly trainingPlanManagementService: TrainingPlanManagementService
  ) {}

  @Get('list')
  @ApiOperation({ summary: 'Lista todos os planos de treino' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos de treino',
    type: [TrainingPlanResponseDto],
  })
  async list(): Promise<TrainingPlanResponseDto[]> {
    const plans = await this.trainingPlanManagementService.list();
    return plans.map((p) => ({ ...p }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo plano de treino' })
  @ApiBody({ type: CreateTrainingPlanRequestDto })
  @ApiResponse({ status: 201, description: 'Plano de treino criado com sucesso' })
  async createTrainingPlan(
    @Body() contentData: CreateTrainingPlanRequestDto
  ): Promise<void> {
    await this.trainingPlanManagementService.create({ ...contentData });
  }

  @Get('list/:authorId')
  @ApiOperation({ summary: 'Lista planos de treino de um autor específico' })
  @ApiParam({ name: 'authorId', description: 'ID do autor' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos do autor',
    type: [TrainingPlanResponseDto],
  })
  async findTrainingPlansByAuthorId(
    @Param('authorId') authorId: string
  ): Promise<TrainingPlanResponseDto[]> {
    const plans = await this.trainingPlanManagementService.listByUserId(authorId);
    return plans.map((p) => ({ ...p }));
  }

  @Get(':trainingPlanId')
  @ApiOperation({ summary: 'Busca um plano de treino pelo ID' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({
    status: 200,
    description: 'Plano de treino encontrado',
    type: TrainingPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plano de treino não encontrado' })
  async findOneTrainingPlanById(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<TrainingPlanResponseDto> {
    const plan = await this.trainingPlanManagementService.get(trainingPlanId);
    return { ...plan };
  }

  @Get('exists/:trainingPlanId')
  @ApiOperation({ summary: 'Verifica se um plano de treino existe' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se o plano existe',
    type: TrainingPlanExistsResponseDto,
  })
  async trainingPlanExists(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<TrainingPlanExistsResponseDto> {
    const exists = await this.trainingPlanManagementService.exists(trainingPlanId);

    return {
      exists: exists,
    };
  }

  @Delete(':trainingPlanId')
  @ApiOperation({ summary: 'Deleta um plano de treino pelo ID' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Plano deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string): Promise<void> {
    await this.trainingPlanManagementService.delete(id);
  }
}
