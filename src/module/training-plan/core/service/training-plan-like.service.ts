import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { TrainingPlanLike } from '../../persistence/entity/training-plan-like.entity';
import { TrainingPlanLikeRepository } from '../../persistence/repository/training-plan-like.repository';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';

@Injectable()
export class TrainingPlanLikeService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanLikeRepository: TrainingPlanLikeRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async like(trainingPlanId: string) {
    const userId = this.request.user.id;
    this.logger.log(
      `Starting like operation. trainingPlanId=${trainingPlanId}, userId=${userId}`
    );

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id: trainingPlanId },
      relations: { privateParticipants: true },
    });
    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.private &&
      trainingPlan.authorId !== userId
    ) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.protected &&
      !trainingPlan.privateParticipants.some((v) => v.userId === userId) &&
      trainingPlan.authorId !== userId
    ) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    const alreadyLiked = await this.trainingPlanLikeRepository.existsBy({
      trainingPlanId,
      likedBy: userId,
    });

    if (alreadyLiked) {
      return;
    }

    await this.trainingPlanLikeRepository.save(
      new TrainingPlanLike({
        likedBy: userId,
        trainingPlanId,
      })
    );
  }

  async removeLike(trainingPlanId: string) {
    const userId = this.request.user.id;
    this.logger.log(
      `Starting removeLike operation. trainingPlanId=${trainingPlanId}, userId=${userId}`
    );

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    await this.trainingPlanLikeRepository.delete({ trainingPlanId, likedBy: userId });
  }
}
