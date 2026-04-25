import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { Cursor } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { TrainingPlanComment } from '../../persistence/entity/training-plan-comment.entity';
import { TrainingPlanCommentRepository } from '../../persistence/repository/training-plan-comment.repository';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { TrainingPlanNotFoundException } from '../exception/training-plan-not-found.exception';
import { TrainingPlanCommentNotFoundException } from '../exception/training-plan-comment-not-found.exception';

@Injectable()
export class TrainingPlanCommentService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanCommentRepository: TrainingPlanCommentRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async listComments(
    trainingPlanId: string,
    cursor?: string,
    limit: number = 10
  ): Promise<TrainingPlanComment[]> {
    this.logger.log('Listing comments for training plan', { trainingPlanId });

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      throw new TrainingPlanNotFoundException(trainingPlanId);
    }

    const decodedCursor: Cursor = cursor
      ? JSON.parse(Buffer.from(cursor, 'base64').toString())
      : undefined;

    if (decodedCursor && decodedCursor.value) {
      decodedCursor.value = new Date(decodedCursor.value);
    }

    const { data: comments } =
      await this.trainingPlanCommentRepository.findManyWithCursor(
        { trainingPlanId },
        limit,
        decodedCursor,
        'createdAt'
      );

    const users = await this.identityUserServiceClient.getUsers(
      comments.map((c) => c.authorId)
    );

    const usersMap = new Map(users.map((u) => [u['id'], u]));
    comments.forEach((comment) => {
      comment.author = usersMap.get(comment.authorId);
    });

    return comments;
  }

  async addComment(trainingPlanId: string, message: string): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log('Adding comment to training plan', {
      trainingPlanId,
      userId,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      throw new TrainingPlanNotFoundException(trainingPlanId);
    }

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new DomainException('user not found');
    }

    const comment = new TrainingPlanComment({
      authorId: userId,
      content: message,
      trainingPlanId: trainingPlan.id,
    });

    await this.trainingPlanCommentRepository.save(comment);
  }

  async removeComment(commentId: string): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log('Removing comment from training plan', {
      commentId,
      userId,
    });

    const comment = await this.trainingPlanCommentRepository.findOneById(commentId);
    if (!comment) {
      throw new TrainingPlanCommentNotFoundException(commentId);
    }

    if (comment.authorId !== userId) {
      throw new DomainException('cannot remove comment of another user');
    }

    await this.trainingPlanCommentRepository.delete({ id: commentId });
  }
}
