import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { TrainingPlanFeedback } from '../../persistence/entity/training-plan-feedback.entity';
import { TrainingPlanFeedbackRepository } from '../../persistence/repository/training-plan-feedback.repository';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';

@Injectable()
export class TrainingPlanFeedbackService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanFeedbackRepository: TrainingPlanFeedbackRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async giveFeedback(newFeedback: {
    trainingPlanId: string;
    rating: number;
    message: string | null;
  }) {
    const userId = this.request.user.id;
    this.logger.log('Giving feedback to training plan', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId,
      rating: newFeedback.rating,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(
      newFeedback.trainingPlanId
    );
    if (!trainingPlan) {
      throw new NotFoundException(
        `Training plan with ID '${newFeedback.trainingPlanId}' was not found.`
      );
    }

    if (trainingPlan?.authorId === userId) {
      throw new DomainException(
        'training plan author cannot give feedback to your training plan'
      );
    }

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const feedback = new TrainingPlanFeedback({
      userId,
      trainingPlanId: newFeedback.trainingPlanId,
      rating: newFeedback.rating,
      message: newFeedback.message,
    });

    await this.trainingPlanFeedbackRepository.save(feedback);
    this.logger.log('Feedback saved successfully', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId,
    });
  }

  async getFeedbacks(
    trainingPlanId: string,
    limit: number,
    lastCursor?: string
  ): Promise<{
    data: {
      trainingPlanId: string;
      userId: string;
      rating: number;
      message: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    this.logger.log('Fetching feedbacks for training plan', {
      trainingPlanId,
      limit,
      lastCursor,
    });

    const decodedCursor = lastCursor
      ? JSON.parse(Buffer.from(lastCursor, 'base64').toString())
      : undefined;

    const { data: feedbacks, nextCursor: rawNextCursor } =
      await this.trainingPlanFeedbackRepository.findManyWithCursor(
        { trainingPlanId },
        limit,
        decodedCursor,
        'createdAt'
      );

    const nextCursorString = rawNextCursor
      ? Buffer.from(JSON.stringify(rawNextCursor)).toString('base64')
      : null;

    return {
      data: feedbacks,
      nextCursor: nextCursorString,
      hasNextPage: !!nextCursorString,
    };
  }
}
