import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/module/shared/module/auth/guard/jwt-auth.guard';
import { PlanSubscriptionManagementService } from '@src/module/training-plan/core/service/plan-subscription-management.service';
import { CreatePlanSubscriptionRequestDto } from '../dto/request/create-plan-subscription-request.dto';
import { DayProgressResponseDto } from '../dto/response/day-progress-response.dto';
import { PlanSubscriptionExistsResponseDto } from '../dto/response/plan-subscription-exists-response.dto';
import { PlanSubscriptionResponseDto } from '../dto/response/plan-subscription-response.dto';

@ApiTags('Plan Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('training-plan')
export class PlanSubscriptionController {
  constructor(
    private readonly planSubscriptionManagementService: PlanSubscriptionManagementService
  ) {}

  @Get('/subscriptions/in-progress')
  @ApiOperation({ summary: 'Retorna a assinatura em andamento de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Assinatura em andamento',
    type: PlanSubscriptionResponseDto,
  })
  async getInProgressSubscription(): Promise<PlanSubscriptionResponseDto> {
    const subscription =
      await this.planSubscriptionManagementService.getInProgressSubscription();
    return {
      ...subscription,
    };
  }

  @Get('/subscriptions')
  @ApiOperation({ summary: 'Lista todas as assinaturas de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de assinaturas',
    type: [PlanSubscriptionResponseDto],
  })
  async getSubscriptions(): Promise<PlanSubscriptionResponseDto[]> {
    const subscriptions = await this.planSubscriptionManagementService.getSubscriptions();
    return subscriptions.map((s) => ({ ...s }));
  }

  @Get(':trainingPlanId/subscriptions/exists')
  @ApiOperation({
    summary: 'Verifica se o usuário possui assinatura de um plano específico',
  })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se a assinatura existe',
    type: PlanSubscriptionExistsResponseDto,
  })
  async exists(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<PlanSubscriptionExistsResponseDto> {
    const exists = await this.planSubscriptionManagementService.exists(trainingPlanId);
    return { ...exists };
  }

  @Get('/:trainingPlanId/subscriptions/exists/in-progress')
  @ApiOperation({
    summary: 'Verifica se o usuário possui assinatura em andamento de um plano',
  })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se a assinatura em andamento existe',
    type: PlanSubscriptionExistsResponseDto,
  })
  async existsInProgress(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<PlanSubscriptionExistsResponseDto> {
    const exists =
      await this.planSubscriptionManagementService.existsInProgress(trainingPlanId);
    return { ...exists };
  }

  @Post('/:trainingPlanId/subscriptions')
  @ApiOperation({ summary: 'Cria uma nova assinatura para o usuário' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso' })
  async createSubscription(
    @Param('trainingPlanId') trainingPlanId: string,
    @Body() data: CreatePlanSubscriptionRequestDto
  ): Promise<void> {
    await this.planSubscriptionManagementService.createSubscription(trainingPlanId, data);
  }

  @Delete('/:trainingPlanId/subscriptions')
  @ApiOperation({ summary: 'Remove uma assinatura existente' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Assinatura removida com sucesso' })
  async removeSubscription(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.removeSubscription(trainingPlanId);
  }

  @Put('/:trainingPlanId/subscriptions/send/in-progress')
  @ApiOperation({ summary: 'Atualiza status da assinatura para em andamento' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Status atualizado para em andamento' })
  async updateStatusToInProgress(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToInProgress(trainingPlanId);
  }

  @Put('/:trainingPlanId/subscriptions/send/finished')
  @ApiOperation({ summary: 'Atualiza status da assinatura para finalizado' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Status atualizado para finalizado' })
  async updateStatusToFinished(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToFinished(trainingPlanId);
  }

  @Put('/:trainingPlanId/subscriptions/send/canceled')
  @ApiOperation({ summary: 'Atualiza status da assinatura para cancelado' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Status atualizado para cancelado' })
  async updateStatusToCanceled(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToCanceled(trainingPlanId);
  }

  @Put('/:trainingPlanId/subscriptions/send/not-started')
  @ApiOperation({ summary: 'Atualiza status da assinatura para não iniciada' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Status atualizado para não iniciada' })
  async updateStatusToNotStarted(
    @Param('trainingPlanId') trainingPlanId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToNotStarted(trainingPlanId);
  }

  @Post('subscriptions/:planSubscriptionId/day/:dayId/progress')
  @ApiOperation({ summary: 'Cria progresso de um dia em uma assinatura' })
  @ApiParam({ name: 'planSubscriptionId', description: 'ID da assinatura' })
  @ApiParam({ name: 'dayId', description: 'ID do dia' })
  @ApiResponse({ status: 201, description: 'Progresso do dia criado' })
  async createDayProgress(
    @Param('planSubscriptionId') planSubscriptionId: string,
    @Param('dayId') dayId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.createDayProgress(
      planSubscriptionId,
      dayId
    );
  }

  @Get('/subscriptions/day/progress')
  @ApiOperation({ summary: 'Retorna progresso de todos os dias de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de progresso dos dias',
    type: [DayProgressResponseDto],
  })
  async getDaysProgress(): Promise<DayProgressResponseDto[]> {
    const progress = await this.planSubscriptionManagementService.getDaysProgress();
    return progress.map((p) => ({ ...p }));
  }
}
