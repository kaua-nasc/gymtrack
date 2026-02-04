import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { Cursor } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import { Day } from '../../persistence/entity/day.entity';
import { Exercise } from '../../persistence/entity/exercise.entity';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { TrainingPlanComment } from '../../persistence/entity/training-plan-comment.entity';
import { TrainingPlanFeedback } from '../../persistence/entity/training-plan-feedback.entity';
import { TrainingPlanLike } from '../../persistence/entity/training-plan-like.entity';
import { TrainingPlanCommentRepository } from '../../persistence/repository/training-plan-comment.repository';
import { TrainingPlanFeedbackRepository } from '../../persistence/repository/training-plan-feedback.repository';
import { TrainingPlanLikeRepository } from '../../persistence/repository/training-plan-like.repository';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanFeedbackRepository: TrainingPlanFeedbackRepository,
    private readonly trainingPlanLikeRepository: TrainingPlanLikeRepository,
    private readonly trainingPlanCommentRepository: TrainingPlanCommentRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    private readonly storageService: AzureStorageService
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    this.logger.log('Checking if training plan exists', { trainingPlanId });
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    this.logger.log('Creating new training plan', {
      authorId: trainingPlanData.authorId,
    });
    const a = await this.identityUserServiceClient.userExists(trainingPlanData.authorId);
    if (!a) {
      this.logger.warn('User not found when creating training plan', {
        authorId: trainingPlanData.authorId,
      });
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.save(
      new TrainingPlan({ ...trainingPlanData })
    );

    this.logger.log('Training plan created successfully', {
      trainingPlanId: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    });

    return {
      id: trainingPlan.id,
      authorId: trainingPlan.authorId,
      name: trainingPlan.name,
    };
  }

  async delete(id: string) {
    this.logger.log('Deleting training plan', { trainingPlanId: id });

    const exists = await this.exists(id);
    if (!exists) {
      this.logger.warn('Attempt to delete non-existing training plan', {
        trainingPlanId: id,
      });
      throw new NotFoundException(`training plan with id ${id} not found`);
    }

    await this.trainingPlanRepository.deleteTrainingPlan(id);
    this.logger.log('Training plan deleted successfully', { trainingPlanId: id });
  }

  async get(id: string, userId: string | null = null) {
    this.logger.log('Fetching training plan details', { trainingPlanId: id });
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
      relations: { days: { exercises: true } },
    });

    if (!trainingPlan) {
      this.logger.warn('Training plan not found', { trainingPlanId: id });
      throw new NotFoundException();
    }

    if (trainingPlan.imageUrl) {
      this.logger.log(`Generating SAS URL for profile picture for user: ${id}`);
      trainingPlan.imageUrl = this.storageService.generateSasUrl(trainingPlan.imageUrl);
    }

    const [likesCount] = await Promise.all([
      this.trainingPlanLikeRepository.count({
        trainingPlanId: id,
      }),
    ]);

    trainingPlan.likesCount = likesCount;

    if (userId && likesCount > 0) {
      const user = await this.trainingPlanLikeRepository.find({
        where: {
          trainingPlanId: id,
          likedBy: userId,
        },
      });
      trainingPlan.likes = user ? [user] : [];
    }

    this.logger.log('Training plan fetched successfully', { trainingPlanId: id });
    return { ...trainingPlan };
  }

  async exists(id: string) {
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
    });

    const exists = !!trainingPlan;
    this.logger.log('Checked if training plan exists', { trainingPlanId: id, exists });

    return exists;
  }

  async list() {
    this.logger.log('Listing all training plans');

    let plans = await this.trainingPlanRepository.findMany({
      relations: {
        privateParticipants: true,
        feedbacks: true,
        planSubscriptions: { planDayProgress: true, privacySettings: true },
        days: { exercises: true },
      },
    });
    this.logger.log('Training plans listed', { count: plans?.length ?? 0 });

    if (!plans) return [];

    const aux: TrainingPlan[] = [];
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      plan.likesCount = await this.trainingPlanLikeRepository.count({
        trainingPlanId: plan.id,
      });

      aux.push(plan);
    }

    plans = aux;
    return plans?.map((p) => {
      if (p.imageUrl) {
        return { ...p, imageUrl: this.storageService.generateSasUrl(p.imageUrl) };
      }

      return { ...p };
    });
  }

  async listByUserId(userId: string): Promise<TrainingPlan[]> {
    this.logger.log('Listing training plans by user ID', { userId });

    const plans = await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
    if (!plans?.length) return [];

    const plansWithLikes = await Promise.all(
      plans.map(async (plan) => {
        plan.likesCount = await this.trainingPlanLikeRepository.count({
          trainingPlanId: plan.id,
        });
        plan.imageUrl = plan.imageUrl
          ? this.storageService.generateSasUrl(plan.imageUrl)
          : null;
        return plan;
      })
    );

    return plansWithLikes;
  }

  async giveFeedback(newFeedback: {
    trainingPlanId: string;
    userId: string;
    rating: number;
    message: string | null;
  }) {
    this.logger.log('Giving feedback to training plan', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId: newFeedback.userId,
      rating: newFeedback.rating,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(
      newFeedback.trainingPlanId
    );

    if (!trainingPlan) {
      this.logger.warn('Feedback failed: training plan not found', {
        trainingPlanId: newFeedback.trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }

    if (trainingPlan?.authorId === newFeedback.userId) {
      this.logger.warn('Training plan author attempted to give feedback to own plan', {
        trainingPlanId: newFeedback.trainingPlanId,
        userId: newFeedback.userId,
      });
      throw new BadRequestException(
        'training plan author cannot give feedback to your training plan'
      );
    }

    if (!(await this.identityUserServiceClient.userExists(newFeedback.userId))) {
      this.logger.warn('Feedback failed: user not found', { userId: newFeedback.userId });
      throw new NotFoundException('user not found');
    }

    const feedback = new TrainingPlanFeedback({
      userId: newFeedback.userId,
      trainingPlanId: newFeedback.trainingPlanId,
      rating: newFeedback.rating,
      message: newFeedback.message,
    });

    await this.trainingPlanFeedbackRepository.save(feedback);
    this.logger.log('Feedback saved successfully', {
      trainingPlanId: newFeedback.trainingPlanId,
      userId: newFeedback.userId,
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

    this.logger.log('Feedbacks fetched successfully', {
      trainingPlanId,
      feedbackCount: feedbacks.length,
      hasNextPage: !!rawNextCursor,
    });

    const nextCursorString = rawNextCursor
      ? Buffer.from(JSON.stringify(rawNextCursor)).toString('base64')
      : null;

    return {
      data: feedbacks,
      nextCursor: nextCursorString,
      hasNextPage: !!nextCursorString,
    };
  }

  async addImage(trainingPlanId: string, file: Buffer) {
    this.logger.log(`Attempting to add image for training plan: ${trainingPlanId}`);
    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn(`Add image failed: Training plan not found: ${trainingPlanId}`);
      throw new NotFoundException('training plan not exists');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${FilePath.trainingPlan}/training-plan-${trainingPlan.id}_${timestamp}.png`;

    this.logger.log(`Uploading new image for plan ${trainingPlanId} to: ${filename}`);
    await this.storageService.upload(filename, file);

    if (trainingPlan.imageUrl) {
      this.logger.log(
        `Deleting old image ${trainingPlan.imageUrl} for plan ${trainingPlanId}`
      );
      await this.storageService.delete(trainingPlan.imageUrl);
    }

    await this.trainingPlanRepository.update(
      { id: trainingPlan.id },
      { imageUrl: filename }
    );
    this.logger.log(
      `Successfully added/updated image for plan ${trainingPlanId}. New file: ${filename}`
    );
  }

  async like(trainingPlanId: string, userId: string) {
    this.logger.log(
      `Starting like operation. trainingPlanId=${trainingPlanId}, userId=${userId}`
    );

    this.logger.log(`Checking if user exists: ${userId}`);
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn(`User does not exist: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    this.logger.log(`Fetching training plan: ${trainingPlanId}`);
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id: trainingPlanId },
      relations: { privateParticipants: true },
    });
    if (!trainingPlan) {
      this.logger.warn(`Training plan not found: ${trainingPlanId}`);
      throw new NotFoundException('training plan not exists');
    }

    this.logger.log(`Validating training plan visibility for user: ${userId}`);

    if (
      trainingPlan.visibility === TrainingPlanVisibility.private &&
      trainingPlan.authorId !== userId
    ) {
      this.logger.warn(
        `User attempted to like a private training plan: ${trainingPlanId}`
      );
      throw new NotFoundException('training plan not exists');
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.protected &&
      !trainingPlan.privateParticipants.some((v) => v.userId === userId) &&
      trainingPlan.authorId !== userId
    ) {
      this.logger.warn(
        `User ${userId} attempted to like a protected training plan without permission: ${trainingPlanId}`
      );
      throw new NotFoundException('training plan not exists');
    }

    this.logger.log(`Checking if like already exists`);
    const alreadyLiked = await this.trainingPlanLikeRepository.find({
      where: {
        trainingPlanId,
        likedBy: userId,
      },
    });

    if (alreadyLiked) {
      this.logger.log(`User already liked this training plan. No action taken.`);
      return;
    }

    this.logger.log(
      `Saving like for userId=${userId} on trainingPlanId=${trainingPlanId}`
    );
    await this.trainingPlanLikeRepository.save(
      new TrainingPlanLike({
        likedBy: userId,
        trainingPlanId,
      })
    );

    this.logger.log(`Like operation completed successfully.`);
  }

  async removeLike(trainingPlanId: string, userId: string) {
    this.logger.log(
      `Starting removeLike operation. trainingPlanId=${trainingPlanId}, userId=${userId}`
    );

    this.logger.log(`Checking if user exists: ${userId}`);
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn(`User does not exist: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    this.logger.log(`Fetching training plan: ${trainingPlanId}`);
    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn(`Training plan not found: ${trainingPlanId}`);
      throw new NotFoundException('training plan not exists');
    }

    this.logger.log(
      `Attempting to remove like. trainingPlanId=${trainingPlanId}, userId=${userId}`
    );
    await this.trainingPlanLikeRepository.delete({ trainingPlanId, likedBy: userId });

    this.logger.log(`Remove like operation completed successfully.`);
  }

  async clone(userId: string, trainingPlanId: string) {
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id: trainingPlanId },
      relations: { privateParticipants: true, days: { exercises: true } },
    });

    if (!trainingPlan) {
      throw new NotFoundException('training plan not found');
    }

    if (trainingPlan?.visibility === TrainingPlanVisibility.private) {
      throw new NotFoundException('training plan not found');
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.protected &&
      !trainingPlan.privateParticipants.some((v) => v.userId === userId) &&
      trainingPlan.authorId !== userId
    ) {
      throw new NotFoundException('training plan not found');
    }

    const clonedTrainingPlan = new TrainingPlan({
      authorId: userId,
      level: trainingPlan.level,
      maxSubscriptions: trainingPlan.maxSubscriptions,
      observation: trainingPlan.observation,
      timeInDays: trainingPlan.timeInDays,
      visibility: TrainingPlanVisibility.private,
      type: trainingPlan.type,
      pathology: trainingPlan.pathology,
      name: trainingPlan.name,
      description: trainingPlan.description,
      days: trainingPlan.days.map((day) => {
        return new Day({
          name: day.name,
          exercises: day.exercises.map((exercise) => {
            return new Exercise({
              name: exercise.name,
              description: exercise.description,
              observation: exercise.observation,
              type: exercise.type,
              repsNumber: exercise.repsNumber,
              setsNumber: exercise.setsNumber,
            });
          }),
        });
      }),
    });

    if (trainingPlan.imageUrl) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${FilePath.trainingPlan}/training-plan-${trainingPlan.id}_${timestamp}.png`;
      clonedTrainingPlan.imageUrl = filename;

      await this.storageService.copy(trainingPlan.imageUrl, clonedTrainingPlan.imageUrl);
    }

    await this.trainingPlanRepository.save(clonedTrainingPlan);
  }

  async listComments(
    trainingPlanId: string,
    cursor?: string,
    limit: number = 10
  ): Promise<TrainingPlanComment[]> {
    this.logger.log('Listing comments for training plan', { trainingPlanId });

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn('Attempted to list comments for non-existing training plan', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
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

    this.logger.log('Comments listed successfully', {
      trainingPlanId,
      commentCount: comments.length,
    });

    return comments;
  }

  async addComment(
    trainingPlanId: string,
    userId: string,
    message: string
  ): Promise<void> {
    this.logger.log('Adding comment to training plan', {
      trainingPlanId,
      userId,
    });

    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      this.logger.warn('Attempted to comment on non-existing training plan', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Attempted to comment by non-existing user', { userId });
      throw new NotFoundException('user not found');
    }

    const comment = new TrainingPlanComment({
      authorId: userId,
      content: message,
      trainingPlanId: trainingPlan.id,
    });

    await this.trainingPlanCommentRepository.save(comment);

    this.logger.log('Comment added successfully', {
      trainingPlanId,
      userId,
    });
  }

  async removeComment(commentId: string, userId: string): Promise<void> {
    this.logger.log('Removing comment from training plan', {
      commentId,
      userId,
    });

    const comment = await this.trainingPlanCommentRepository.findOneById(commentId);
    if (!comment) {
      this.logger.warn('Attempted to remove non-existing comment', { commentId });
      throw new NotFoundException('comment not found');
    }

    if (comment.authorId !== userId) {
      this.logger.warn('User attempted to remove comment they do not own', {
        commentId,
        userId,
      });
      throw new BadRequestException('cannot remove comment of another user');
    }

    await this.trainingPlanCommentRepository.delete({ id: commentId });

    this.logger.log('Comment removed successfully', {
      commentId,
      userId,
    });
  }
}
