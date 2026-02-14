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
@Controller('training-plan/subscription')
export class PlanSubscriptionController {
  constructor(
    private readonly planSubscriptionManagementService: PlanSubscriptionManagementService
  ) {}

  @Get('/:userId')
  @ApiOperation({ summary: 'Retorna a assinatura em andamento de um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Assinatura em andamento',
    type: PlanSubscriptionResponseDto,
  })
  async getInProgressSubscription(
    @Param('userId') userId: string
  ): Promise<PlanSubscriptionResponseDto> {
    const subscription =
      await this.planSubscriptionManagementService.getInProgressSubscription(userId);
    return {
      ...subscription,
    };
  }

  @Get('/list/:userId')
  @ApiOperation({ summary: 'Lista todas as assinaturas de um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de assinaturas',
    type: [PlanSubscriptionResponseDto],
  })
  async getSubscriptions(
    @Param('userId') userId: string
  ): Promise<PlanSubscriptionResponseDto[]> {
    const subscriptions =
      await this.planSubscriptionManagementService.getSubscriptions(userId);
    return subscriptions.map((s) => ({
      id: s.id,
      trainingPlanId: s.trainingPlanId,
      status: s.status,
      type: s.type,
    }));
  }

  @Get('/exists/:trainingPlanId/:userId')
  @ApiOperation({
    summary: 'Verifica se o usuário possui assinatura de um plano específico',
  })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se a assinatura existe',
    type: PlanSubscriptionExistsResponseDto,
  })
  async exists(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<PlanSubscriptionExistsResponseDto> {
    const exists = await this.planSubscriptionManagementService.exists(
      trainingPlanId,
      userId
    );
    return { ...exists };
  }

  @Get('/exists/in-progress/:trainingPlanId/:userId')
  @ApiOperation({
    summary: 'Verifica se o usuário possui assinatura em andamento de um plano',
  })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Retorna se a assinatura em andamento existe',
    type: PlanSubscriptionExistsResponseDto,
  })
  async existsInProgress(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<PlanSubscriptionExistsResponseDto> {
    const exists = await this.planSubscriptionManagementService.existsInProgress(
      trainingPlanId,
      userId
    );
    return { ...exists };
  }

  @Post('/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Cria uma nova assinatura para o usuário' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 201, description: 'Assinatura criada com sucesso' })
  async createSubscription(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string,
    @Body() data: CreatePlanSubscriptionRequestDto
  ): Promise<void> {
    await this.planSubscriptionManagementService.createSubscription(
      trainingPlanId,
      userId,
      data
    );
  }

  @Delete('/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Remove uma assinatura existente' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Assinatura removida com sucesso' })
  async removeSubscription(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.removeSubscription(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/in-progress/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Atualiza status da assinatura para em andamento' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Status atualizado para em andamento' })
  async updateStatusToInProgress(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToInProgress(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/finished/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Atualiza status da assinatura para finalizado' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Status atualizado para finalizado' })
  async updateStatusToFinished(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToFinished(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/canceled/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Atualiza status da assinatura para cancelado' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Status atualizado para cancelado' })
  async updateStatusToCanceled(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToCanceled(
      trainingPlanId,
      userId
    );
  }

  @Put('/send/not-started/:trainingPlanId/:userId')
  @ApiOperation({ summary: 'Atualiza status da assinatura para não iniciada' })
  @ApiParam({ name: 'trainingPlanId', description: 'ID do plano de treino' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Status atualizado para não iniciada' })
  async updateStatusToNotStarted(
    @Param('trainingPlanId') trainingPlanId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.planSubscriptionManagementService.updateStatusToNotStarted(
      trainingPlanId,
      userId
    );
  }

  @Post('/day/progress/:planSubscriptionId/:dayId')
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

  @Get('/day/progress/:userId')
  @ApiOperation({ summary: 'Retorna progresso de todos os dias de um usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de progresso dos dias',
    type: [DayProgressResponseDto],
  })
  async getDaysProgress(
    @Param('userId') userId: string
  ): Promise<DayProgressResponseDto[]> {
    const progress = await this.planSubscriptionManagementService.getDaysProgress(userId);
    return progress.map((p) => ({ ...p }));
  }
}
