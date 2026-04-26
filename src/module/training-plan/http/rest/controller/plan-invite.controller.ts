import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { PlanInviteManagementService } from '@src/module/training-plan/core/service/plan-invite-management.service';
import { ShareTrainingPlanRequestDto } from '../dto/request/share-training-plan-request.dto';

@ApiTags('Training Plan Invites')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('training-plan')
export class PlanInviteController {
  constructor(
    private readonly planInviteManagementService: PlanInviteManagementService
  ) {}

  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compartilha um plano de treino com outro usuário' })
  @ApiParam({ name: 'id', description: 'ID do plano de treino' })
  @ApiResponse({ status: 200, description: 'Plano compartilhado com sucesso' })
  @ApiResponse({
    status: 403,
    description: 'Ação não permitida (não é autor ou plano privado)',
  })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async share(
    @Param('id') id: string,
    @Body() shareDto: ShareTrainingPlanRequestDto
  ): Promise<void> {
    await this.planInviteManagementService.share(id, shareDto);
  }
}
