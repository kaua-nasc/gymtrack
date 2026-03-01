import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EmailService } from '@src/module/shared/module/email/service/email.service';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { PlanInviteRepository } from '@src/module/training-plan/persistence/repository/plan-invite.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { ShareTrainingPlanRequestDto } from '../../http/rest/dto/request/share-training-plan-request.dto';
import { PlanInvite } from '../../persistence/entity/plan-invite.entity';
import { PlanInviteStatus } from '../enum/plan-invite-status.enum';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';

@Injectable({ scope: Scope.REQUEST })
export class PlanInviteManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly planInviteRepository: PlanInviteRepository,
    private readonly emailService: EmailService,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  async share(planId: string, shareDto: ShareTrainingPlanRequestDto): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log('Sharing training plan', {
      planId,
      senderId: userId,
      recipientEmail: shareDto.recipientEmail,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(planId);

    if (!trainingPlan) {
      this.logger.warn('Share failed: training plan not found', { planId });
      throw new NotFoundException('Training plan not found');
    }

    // Specification: Only the creator of this plan can share it.
    if (trainingPlan.authorId !== userId) {
      this.logger.warn('Share failed: user is not the author', { planId, userId });
      throw new ForbiddenException('Only the creator of this plan can share it');
    }

    // Specification: Private plans cannot be shared.
    if (trainingPlan.visibility === TrainingPlanVisibility.private) {
      this.logger.warn('Share failed: training plan is private', { planId });
      throw new ForbiddenException(
        'Private plans cannot be shared. Please change visibility to Protected or Public first.'
      );
    }

    const invite = new PlanInvite({
      planId,
      senderId: userId,
      recipientEmail: shareDto.recipientEmail,
      recipientId: shareDto.recipientId ?? null,
      status: PlanInviteStatus.PENDING,
    });

    await this.planInviteRepository.save(invite);

    // Send email
    await this.emailService.sendEmail({
      to: shareDto.recipientEmail,
      subject: 'Um plano de treino foi compartilhado com você!',
      text: `Olá! Um plano de treino "${trainingPlan.name}" foi compartilhado com você no GymTrack. Acesse em: https://app.gymtrack.com/plans/${planId}`,
      html: `<p>Olá!</p><p>Um plano de treino <strong>"${trainingPlan.name}"</strong> foi compartilhado com você no GymTrack.</p><p><a href="https://app.gymtrack.com/plans/${planId}">Clique aqui para acessar o plano</a></p><p><em>Nota: Você precisará estar logado para visualizar o plano.</em></p>`,
    });

    this.logger.log('Training plan shared successfully', { planId, inviteId: invite.id });
  }
}
