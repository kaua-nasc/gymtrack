import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrainingPlanManagementService } from '@src/module/training-plan/core/service/training-plan-management.service';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlanExistsResponseDto } from '../dto/response/training-plan-exists-response.dto';
import { TrainingPlanResponseDto } from '../dto/response/training-plan-response.dto';
import { CreateTrainingPlanFeedbackRequestDto } from '../dto/request/create-training-plan-feedback-request.dto';
import { TrainingPlanFeedbackResponseDto } from '../dto/response/training-plan-feedback-response.dto';

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
  ): Promise<{ id: string }> {
    const result = await this.trainingPlanManagementService.create({ ...contentData });

    return { id: result.id };
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
  @ApiParam({
    name: 'trainingPlanId',
    description: 'ID do plano de treino a ser deletado',
    example: 'c4b65c51-89a3-4f32-93e2-8a9f78b26c71',
  })
  @ApiResponse({ status: 200, description: 'Plano deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado.' })
  async deleteTrainingPlanById(@Param('trainingPlanId') id: string): Promise<void> {
    await this.trainingPlanManagementService.delete(id);
  }

  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Envia um feedback sobre um plano de treino',
    description:
      'Permite que um usuário envie feedback textual e/ou nota para um plano de treino específico.',
  })
  @ApiBody({
    type: CreateTrainingPlanFeedbackRequestDto,
    description: 'Dados do feedback a ser enviado',
    examples: {
      default: {
        summary: 'Exemplo de envio de feedback',
        value: {
          trainingPlanId: 'c4b65c51-89a3-4f32-93e2-8a9f78b26c71',
          userId: '0d5f4e8d-9f9c-47a2-96c1-d3a02fcb0a50',
          rating: 5,
          message: 'Plano excelente, bem estruturado e progressivo!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback enviado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos no corpo da requisição.',
  })
  async giveFeedback(
    @Body() feedback: CreateTrainingPlanFeedbackRequestDto
  ): Promise<void> {
    await this.trainingPlanManagementService.giveFeedback({ ...feedback });
  }

  @Get('feedbacks/:trainingPlanId')
  @ApiOperation({
    summary: 'Lista feedbacks de um plano de treino',
    description:
      'Retorna uma lista paginada de feedbacks associados a um plano de treino, com suporte a cursor e limite.',
  })
  @ApiParam({
    name: 'trainingPlanId',
    description: 'ID do plano de treino',
    example: 'c4b65c51-89a3-4f32-93e2-8a9f78b26c71',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de feedbacks a retornar (padrão: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      'Cursor de paginação — use o valor retornado na resposta anterior para buscar a próxima página.',
    example: '2025-11-08T12:45:00.000Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de feedbacks retornada com sucesso.',
    type: TrainingPlanFeedbackResponseDto,
  })
  async getFeedbacks(
    @Param('trainingPlanId') trainingPlanId: string,
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string
  ): Promise<TrainingPlanFeedbackResponseDto> {
    const feedbacks = await this.trainingPlanManagementService.getFeedbacks(
      trainingPlanId,
      limit,
      cursor
    );

    return {
      ...feedbacks,
      data: feedbacks.data.map((f) => ({ ...f })),
    };
  }
}
