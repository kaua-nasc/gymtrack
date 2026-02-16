import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { CreatePlanSubscriptionRequestDto } from '../../http/rest/dto/request/create-plan-subscription-request.dto';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';
import { DayRepository } from '../../persistence/repository/day.repository';
import { PlanDayProgressRepository } from '../../persistence/repository/plan-day-progress.repository';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { TrainingPlanRepository } from '../../persistence/repository/training-plan.repository';
import { PlanSubscriptionStatus } from '../enum/plan-subscription-status.enum';

@Injectable()
export class PlanSubscriptionManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    private readonly planDayProgressRepository: PlanDayProgressRepository,
    private readonly dayRepository: DayRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  async getInProgressSubscription(): Promise<PlanSubscription> {
    const userId = this.request.user.id;

    this.logger.log('Fetching in-progress subscription for user', { userId });
    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, status: PlanSubscriptionStatus.inProgress },
      relations: {
        planDayProgress: true,
      },
    });

    if (!subscription) {
      this.logger.warn('In-progress subscription not found for user', { userId });
      throw new NotFoundException(
        `Subscription by user with id ${userId} in progress not found`
      );
    }

    this.logger.log('Successfully fetched in-progress subscription', {
      userId,
      subscriptionId: subscription.id,
    });
    return subscription;
  }

  async getSubscriptions(): Promise<PlanSubscription[]> {
    const userId = this.request.user.id;
    this.logger.log('Fetching all subscriptions for user', { userId });
    const subscriptions = await this.planSubscriptionRepository.findMany({
      where: { userId },
      relations: {
        trainingPlan: {
          days: true,
        },
      },
    });

    if (!subscriptions || subscriptions.length === 0) {
      this.logger.log('No subscriptions found for user', { userId });
      return [];
    }

    let inProgressDays: Array<PlanDayProgress | null> = Array(7).fill(null);
    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i].status === PlanSubscriptionStatus.inProgress) {
        this.logger.log('Fetching day progress for in-progress subscription', {
          subscriptionId: subscriptions[i].id,
        });
        const daysProgress = await this.planDayProgressRepository.getDaysProgressAtWeek(
          subscriptions[i].id
        );
        if (daysProgress) {
          inProgressDays = daysProgress;
        }
      }
    }

    this.logger.log(
      `Successfully fetched ${subscriptions.length} subscriptions for user`,
      {
        userId,
      }
    );
    return subscriptions.map((s) =>
      s.status === PlanSubscriptionStatus.inProgress
        ? Object.assign(s, { planDayProgress: inProgressDays })
        : s
    );
  }

  async exists(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Checking if subscription exists', { userId, trainingPlanId });
    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    const exists = subscription ? true : false;
    this.logger.log('Subscription existence check complete', {
      userId,
      trainingPlanId,
      exists,
    });
    return { exists };
  }

  async existsInProgress(trainingPlanId: string) {
    const userId = this.request.user.id;
    this.logger.log('Checking if in-progress subscription exists', {
      userId,
      trainingPlanId,
    });
    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
        status: PlanSubscriptionStatus.inProgress,
      },
    });

    const exists = subscription ? true : false;
    this.logger.log('In-progress subscription existence check complete', {
      userId,
      trainingPlanId,
      exists,
    });
    return { exists };
  }

  async createSubscription(
    trainingPlanId: string,
    planSubscription: CreatePlanSubscriptionRequestDto
  ) {
    const userId = this.request.user.id;

    this.logger.log('Attempting to create subscription', { userId, trainingPlanId });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Create subscription failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Create subscription failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    if (
      await this.planSubscriptionRepository.find({
        where: {
          userId: userId,
          trainingPlanId: trainingPlanId,
        },
      })
    ) {
      this.logger.warn('Create subscription failed: User already subscribed', {
        userId,
        trainingPlanId,
      });
      throw new ConflictException('user already subscribed in this training plan');
    }

    const subscription = new PlanSubscription({
      trainingPlanId: trainingPlanId,
      userId: userId,
      type: planSubscription.type,
    });
    await this.planSubscriptionRepository.save(subscription);
    this.logger.log('Successfully created subscription', {
      userId,
      trainingPlanId,
      subscriptionId: subscription.id,
    });
  }

  async removeSubscription(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Attempting to remove subscription', { userId, trainingPlanId });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Remove subscription failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Remove subscription failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      this.logger.warn('Remove subscription failed: Subscription not found', {
        userId,
        trainingPlanId,
      });
      throw new NotFoundException('subscription not found');
    }

    if (
      subscription.status !== PlanSubscriptionStatus.canceled &&
      subscription.status !== PlanSubscriptionStatus.notStarted
    ) {
      this.logger.warn('Remove subscription failed: Invalid status for removal', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      throw new BadRequestException(
        'Subscription status must be "not started" or "canceled"'
      );
    }

    await this.planSubscriptionRepository.remove(subscription);
    this.logger.log('Successfully removed subscription', {
      userId,
      trainingPlanId,
      subscriptionId: subscription.id,
    });
  }

  async updateStatusToInProgress(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Updating subscription status to IN_PROGRESS', {
      userId,
      trainingPlanId,
    });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Update status failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Update status failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      this.logger.warn('Update status failed: Subscription not found', {
        userId,
        trainingPlanId,
      });
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.notStarted) {
      this.logger.warn('Update status failed: Status not NOT_STARTED', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      throw new BadRequestException('Subscription status must be "not started"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.inProgress }
    );
    this.logger.log('Successfully updated subscription status to IN_PROGRESS', {
      subscriptionId: subscription.id,
    });
  }

  async updateStatusToFinished(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Updating subscription status to FINISHED', {
      userId,
      trainingPlanId,
    });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Update status failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Update status failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      this.logger.warn('Update status failed: Subscription not found', {
        userId,
        trainingPlanId,
      });
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      this.logger.warn('Update status failed: Status not IN_PROGRESS', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      throw new BadRequestException('Subscription status must be "in progress".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.completed }
    );
    this.logger.log('Successfully updated subscription status to FINISHED', {
      subscriptionId: subscription.id,
    });
  }

  async updateStatusToCanceled(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Updating subscription status to CANCELED', {
      userId,
      trainingPlanId,
    });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Update status failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Update status failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      this.logger.warn('Update status failed: Subscription not found', {
        userId,
        trainingPlanId,
      });
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      this.logger.warn('Update status failed: Status not IN_PROGRESS', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      throw new BadRequestException('Subscription status must be "in progress".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.canceled }
    );
    this.logger.log('Successfully updated subscription status to CANCELED', {
      subscriptionId: subscription.id,
    });
  }

  async updateStatusToNotStarted(trainingPlanId: string) {
    const userId = this.request.user.id;

    this.logger.log('Updating subscription status to NOT_STARTED', {
      userId,
      trainingPlanId,
    });
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      this.logger.warn('Update status failed: Training plan not found', {
        trainingPlanId,
      });
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      this.logger.warn('Update status failed: User not found', { userId });
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      this.logger.warn('Update status failed: Subscription not found', {
        userId,
        trainingPlanId,
      });
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.canceled) {
      this.logger.warn('Update status failed: Status not CANCELED', {
        subscriptionId: subscription.id,
        status: subscription.status,
      });
      throw new BadRequestException('Subscription status must be "canceled".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.notStarted }
    );
    this.logger.log('Successfully updated subscription status to NOT_STARTED', {
      subscriptionId: subscription.id,
    });
  }

  async createDayProgress(planSubscriptionId: string, dayId: string) {
    this.logger.log('Attempting to create day progress', { planSubscriptionId, dayId });
    const subscription = await this.planSubscriptionRepository.find({
      where: {
        id: planSubscriptionId,
        status: PlanSubscriptionStatus.inProgress,
      },
    });

    if (!subscription) {
      this.logger.warn('Create day progress failed: In-progress subscription not found', {
        planSubscriptionId,
      });
      throw new NotFoundException('subscription not found');
    }

    const day = await this.dayRepository.findDayById(dayId);

    if (!day) {
      this.logger.warn('Create day progress failed: Day not found', { dayId });
      throw new NotFoundException('day not found');
    }

    const newDayProgress = await this.planDayProgressRepository.create(
      new PlanDayProgress({ dayId, planSubscriptionId })
    );

    this.logger.log('Successfully created day progress', {
      planSubscriptionId,
      dayId,
      dayProgressId: newDayProgress.id,
    });
    return newDayProgress;
  }

  async getDaysProgress(): Promise<PlanDayProgress[]> {
    const userId = this.request.user.id;

    this.logger.log('Fetching days progress for user', { userId });
    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, status: PlanSubscriptionStatus.inProgress },
    });

    if (!subscription) {
      this.logger.warn(
        'Get days progress failed: In-progress subscription not found for user',
        {
          userId,
        }
      );
      throw new NotFoundException('subscription not found');
    }

    const daysProgress = await this.planDayProgressRepository.findMany({
      where: { planSubscriptionId: subscription.id },
    });

    this.logger.log('Successfully fetched days progress', {
      userId,
      subscriptionId: subscription.id,
      progressCount: daysProgress?.length ?? 0,
    });
    return daysProgress ?? [];
  }
}
