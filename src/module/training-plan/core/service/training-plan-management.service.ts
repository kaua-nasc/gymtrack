import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { PlanSubscriptionStatus } from '../../core/enum/plan-subscription-status.enum';
import { CreateTrainingPlanRequestDto } from '../../http/rest/dto/request/create-training-plan-request.dto';
import {
  TrainingPlanListResponseDto,
  TrainingPlanResponseDto,
} from '../../http/rest/dto/response/training-plan-response.dto';
import { Day } from '../../persistence/entity/day.entity';
import { Exercise } from '../../persistence/entity/exercise.entity';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';
import { TrainingPlan } from '../../persistence/entity/training-plan.entity';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { TrainingPlanLikeRepository } from '../../persistence/repository/training-plan-like.repository';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';

@Injectable({ scope: Scope.REQUEST })
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanLikeRepository: TrainingPlanLikeRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    private readonly storageService: AzureStorageService,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async traningPlanExists(trainingPlanId: string) {
    this.logger.log('Checking if training plan exists', { trainingPlanId });
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async create(trainingPlanData: CreateTrainingPlanRequestDto) {
    const { id: userId, type: userType } = this.request.user;

    this.logger.log('Creating new training plan', {
      authorId: userId,
      userType,
    });

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('User not found when creating training plan', {
        userId,
      });
      throw new DomainException('user not found');
    }

    let visibility = trainingPlanData.visibility;

    if (userType === UserType.client) {
      const plansCount = await this.trainingPlanRepository.count({
        authorId: userId,
      });

      if (plansCount >= 1) {
        this.logger.warn('Client already has a training plan', { userId });
        throw new DomainException(
          'Users with profile CLIENT can only have one personal training plan. Please delete your existing plan to create a new one.'
        );
      }

      visibility = TrainingPlanVisibility.private;
    }

    const trainingPlan = await this.trainingPlanRepository.save(
      new TrainingPlan({
        ...trainingPlanData,
        visibility,
        authorId: userId,
      })
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

    const trainingPlan = await this.trainingPlanRepository.findOneTrainingPlanById(id);
    if (!trainingPlan) {
      this.logger.warn('Attempt to delete non-existing training plan', {
        trainingPlanId: id,
      });
      throw new NotFoundException(`Training plan with ID '${id}' was not found.`);
    }

    await this.authorizeAccess(trainingPlan);

    await this.trainingPlanRepository.deleteTrainingPlan(id);
    this.logger.log('Training plan deleted successfully', { trainingPlanId: id });
  }

  private async authorizeAccess(trainingPlan: TrainingPlan): Promise<void> {
    const { id: userId } = this.request.user;

    // 1. Check if the user is the author
    if (trainingPlan.authorId === userId) {
      return;
    }

    // 2. Check if the user is the trainer of the author (student)
    const trainerId = await this.identityUserServiceClient.getTrainerId(
      trainingPlan.authorId
    );

    if (trainerId === userId) {
      this.logger.log(
        `Authorization granted: User ${userId} is the trainer of author ${trainingPlan.authorId}`
      );
      return;
    }

    this.logger.warn(
      `Authorization denied for user ${userId} on plan ${trainingPlan.id}`
    );
    throw new DomainException('you are not authorized to modify this training plan');
  }

  async get(id: string) {
    const userId = this.request.user.id;

    this.logger.log('Fetching training plan details', { trainingPlanId: id });
    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id },
      relations: {
        days: { exercises: true },
        privateParticipants: true,
        planSubscriptions: { planDayProgress: true, privacySettings: true },
      },
    });

    if (!trainingPlan) {
      this.logger.warn('Training plan not found', { trainingPlanId: id });
      throw new NotFoundException(`Training plan with ID '${id}' was not found.`);
    }

    if (trainingPlan.imageUrl) {
      this.logger.log(`Generating URL for profile picture for user: ${id}`);
      trainingPlan.imageUrl = this.storageService.generateUrl(trainingPlan.imageUrl);
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
      trainingPlan.likedByCurrentUser = !!user;
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

  async list(
    limit: number = 10,
    lastCursor?: string
  ): Promise<TrainingPlanListResponseDto> {
    const userId = this.request.user?.id;
    this.logger.log('Listing all training plans', { userId, limit, lastCursor });

    const decodedCursor = lastCursor
      ? JSON.parse(Buffer.from(lastCursor, 'base64').toString())
      : undefined;

    const { data: plans, nextCursor: rawNextCursor } =
      await this.trainingPlanRepository.findManyWithCursor(
        [
          {
            visibility: TrainingPlanVisibility.public,
          },
          ...(userId
            ? [
                {
                  visibility: TrainingPlanVisibility.protected,
                  privateParticipants: { userId },
                },
                {
                  authorId: userId,
                },
              ]
            : []),
        ],
        limit,
        decodedCursor,
        'createdAt',
        {
          privateParticipants: true,
          planSubscriptions: { planDayProgress: true, privacySettings: true },
        }
      );

    this.logger.log('Training plans listed', { count: plans?.length ?? 0 });

    if (!plans || plans.length === 0)
      return { data: [], nextCursor: null, hasNextPage: false };

    const planIds = plans.map((p) => p.id);
    const authorIds = [...new Set(plans.map((p) => p.authorId))];

    const [likesCounts, userLikes, authors, subscriptions] = await Promise.all([
      this.trainingPlanLikeRepository.countByTrainingPlanIds(planIds),
      userId
        ? this.trainingPlanLikeRepository.findLikesByPlanIdsAndUserId(planIds, userId)
        : Promise.resolve([]),
      this.identityUserServiceClient.getUsers(authorIds),
      this.planSubscriptionRepository.getUserSubscriptionForPlan(userId, planIds),
    ]);

    const likesCountMap = new Map<string, number>(
      likesCounts.map((lc) => [lc.trainingPlanId, lc.count])
    );
    const userLikesSet = new Set(userLikes.map((ul) => ul.trainingPlanId));
    const authorsMap = new Map(authors.map((a) => [a.id, a]));
    const subscriptionsMap = new Map<string, PlanSubscription[]>();
    subscriptions.forEach((subscription) => {
      const planId = subscription.trainingPlanId;
      if (!subscriptionsMap.has(planId)) {
        subscriptionsMap.set(planId, []);
      }

      const subs = subscriptionsMap.get(planId);
      if (!subs) return;
      subs.push(subscription);
    });

    const data = plans.map((p) => {
      p.author = authorsMap.get(p.authorId);
      p.likesCount = likesCountMap.get(p.id) || 0;
      p.likedByCurrentUser = userLikesSet.has(p.id);

      const userPlanSub = (subscriptionsMap.get(p.id) ?? []).find(
        (sub) => sub.userId === userId
      );

      p.planSubscriptionStatus = userPlanSub ? userPlanSub.status.toString() : undefined;

      if (p.imageUrl) {
        p.imageUrl = this.storageService.generateUrl(p.imageUrl);
      }

      return p;
    });

    const nextCursorString = rawNextCursor
      ? Buffer.from(JSON.stringify(rawNextCursor)).toString('base64')
      : null;

    return {
      data,
      nextCursor: nextCursorString,
      hasNextPage: !!nextCursorString,
    };
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
          ? this.storageService.generateUrl(plan.imageUrl)
          : null;
        return plan;
      })
    );

    return plansWithLikes;
  }

  async addImage(trainingPlanId: string, file: Buffer) {
    this.logger.log(`Attempting to add image for training plan: ${trainingPlanId}`);
    const trainingPlan = await this.trainingPlanRepository.findOneById(trainingPlanId);
    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    await this.authorizeAccess(trainingPlan);

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

  async clone(trainingPlanId: string) {
    const userId = this.request.user.id;
    this.logger.log('Cloning training plan', { userId, trainingPlanId });
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new DomainException('user not found');
    }

    const trainingPlan = await this.trainingPlanRepository.find({
      where: { id: trainingPlanId },
      relations: { privateParticipants: true, days: { exercises: true } },
    });

    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    if (trainingPlan?.visibility === TrainingPlanVisibility.private) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
    }

    if (
      trainingPlan.visibility === TrainingPlanVisibility.protected &&
      !trainingPlan.privateParticipants.some((v) => v.userId === userId) &&
      trainingPlan.authorId !== userId
    ) {
      throw new NotFoundException(`Training plan with ID '${trainingPlanId}' was not found.`);
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

  async getTrainingPlanInProgress(): Promise<TrainingPlanResponseDto | null> {
    const userId = this.request.user.id;
    this.logger.log('Fetching training plan in progress for user', { userId });

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        status: PlanSubscriptionStatus.inProgress,
      },
      relations: {
        trainingPlan: {
          days: true,
        },
        planDayProgress: true,
      },
    });

    if (!subscription) {
      this.logger.log('No training plan in progress found for user', { userId });
      return null;
    }

    const trainingPlan = subscription.trainingPlan;
    const weekStatus: Record<string, boolean> = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };

    const days = trainingPlan.days;
    const progress = subscription.planDayProgress;
    const trainedDayIds = new Set(progress.map((p) => p.dayId));

    for (const day of days) {
      const dayName = day.name.toLowerCase();

      if (dayName in weekStatus) {
        weekStatus[dayName] = trainedDayIds.has(day.id);
      }
    }

    if (trainingPlan.imageUrl) {
      trainingPlan.imageUrl = this.storageService.generateUrl(trainingPlan.imageUrl);
    }

    return {
      ...trainingPlan,
      weekStatus,
      likesCount: await this.trainingPlanLikeRepository.count({
        trainingPlanId: trainingPlan.id,
      }),
      likedByCurrentUser: await this.trainingPlanLikeRepository.existsBy({
        trainingPlanId: trainingPlan.id,
        likedBy: userId,
      }),
    };
  }
}
