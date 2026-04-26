import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { AccessDeniedException } from '@src/module/shared/core/exception/access-denied.exception';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { TrainingPlanRepository } from '../../persistence/repository/training-plan.repository';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';
import { TrainingPlanNotFoundException } from '../exception/training-plan-not-found.exception';

@Injectable()
export class PlanInviteManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } },
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi
  ) {}

  async share(
    trainingPlanId: string,
    shareDto: { recipientEmail: string; recipientId?: string }
  ) {
    const { id: userId } = this.request.user;

    this.logger.log('Sharing training plan', { trainingPlanId, userId });

    const trainingPlan =
      await this.trainingPlanRepository.findOneTrainingPlanById(trainingPlanId);

    if (!trainingPlan) {
      throw new TrainingPlanNotFoundException(trainingPlanId);
    }

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    if (
      shareDto.recipientId &&
      !(await this.identityUserServiceClient.userExists(shareDto.recipientId))
    ) {
      throw new NotFoundException(
        `User with ID '${shareDto.recipientId}' not has an account.`
      );
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.private &&
      trainingPlan.authorId !== userId
    ) {
      throw new ForbiddenException(
        'This training plan is private and can only be shared by its author.'
      );
    }

    if (trainingPlan.visibility === TrainingPlanVisibility.private) {
      throw new AccessDeniedException('This training plan is private.');
    }

    if (trainingPlan.authorId !== userId) {
      throw new AccessDeniedException('Only the creator of this plan can share it');
    }

    const invitationToken = Math.random().toString(36).substring(2, 15);

    this.logger.log('Training plan shared successfully', {
      trainingPlanId,
      invitationToken,
    });

    return { invitationToken };
  }
}
