import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';
import { PlanSubscriptionStatus } from '../enum/plan-subscription-status.enum';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { TrainingPlanRepository } from '../../persistence/repository/training-plan.repository';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { PlanDayProgressRepository } from '../../persistence/repository/plan-day-progress.repository';
import { PlanDayProgress } from '../../persistence/entity/plan-day-progress.entity';
import { DayRepository } from '../../persistence/repository/day.repository';
import dayjs from 'dayjs';

@Injectable()
export class PlanSubscriptionManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    private readonly planDayProgressRepository: PlanDayProgressRepository,
    private readonly dayRepository: DayRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi
  ) {}

  async getInProgressSubscription(userId: string) {
    return await this.planSubscriptionRepository.find({
      where: { userId, status: PlanSubscriptionStatus.inProgress },
      relations: {
        planDayProgress: true,
      },
    });
  }

  async getSubscriptions(userId: string) {
    const subscriptions = await this.planSubscriptionRepository.findMany({
      where: { userId },
      relations: {
        trainingPlan: {
          days: true,
        },
      },
    });

    if (!subscriptions) return [];

    const inProgressDays: Array<PlanDayProgress | null> = Array(7).fill(null);
    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i].status === PlanSubscriptionStatus.inProgress) {
        const daysProgress = await this.planDayProgressRepository.getDaysProgressAtWeek(
          subscriptions[i].id
        );
        if (daysProgress) {
          for (let j = 0; j < daysProgress.length; j++) {
            inProgressDays[dayjs(daysProgress[j].createdAt).day()] = daysProgress[j];
          }
        }
      }
    }

    return subscriptions.map((s) => {
      if (s.status === PlanSubscriptionStatus.inProgress) {
        return { ...s, planDayProgress: inProgressDays };
      }
      return { ...s };
    });
  }

  async exists(trainingPlanId: string, userId: string) {
    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    return {
      exists: subscription ? true : false,
    };
  }

  async createSubscription(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    if (
      await this.planSubscriptionRepository.find({
        where: {
          userId,
          trainingPlanId,
        },
      })
    ) {
      throw new ConflictException('user already subscribed in this training plan');
    }

    const subscription = new PlanSubscription({
      trainingPlanId: trainingPlanId,
      userId,
    });
    await this.planSubscriptionRepository.save(subscription);
  }

  async removeSubscription(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    if (
      subscription.status !== PlanSubscriptionStatus.canceled &&
      subscription.status !== PlanSubscriptionStatus.notStarted
    ) {
      throw new BadRequestException(
        'Subscription status must be "not started" or "canceled"'
      );
    }

    await this.planSubscriptionRepository.remove(subscription);
  }

  async updateStatusToInProgress(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.notStarted) {
      throw new BadRequestException('Subscription status must be "not started"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.inProgress }
    );
  }

  async updateStatusToFinished(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      throw new BadRequestException('Subscription status must be "in progress".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.completed }
    );
  }

  async updateStatusToCanceled(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      throw new BadRequestException('Subscription status must be "in progress".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.canceled }
    );
  }

  async updateStatusToNotStarted(trainingPlanId: string, userId: string) {
    if (!(await this.trainingPlanRepository.exists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }
    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const subscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    if (subscription.status !== PlanSubscriptionStatus.canceled) {
      throw new BadRequestException('Subscription status must be "canceled".');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.notStarted }
    );
  }

  async createDayProgress(planSubscriptionId: string, dayId: string) {
    const subscription = await this.planSubscriptionRepository.find({
      where: {
        id: planSubscriptionId,
        status: PlanSubscriptionStatus.inProgress,
      },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    const day = await this.dayRepository.findDayById(dayId);

    if (!day) {
      throw new NotFoundException('day not found');
    }

    return await this.planDayProgressRepository.create(
      new PlanDayProgress({ dayId, planSubscriptionId })
    );
  }

  async getDaysProgress(userId: string) {
    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, status: PlanSubscriptionStatus.inProgress },
    });

    if (!subscription) {
      throw new NotFoundException('subscription not found');
    }

    const daysProgress = await this.planDayProgressRepository.findMany({
      where: { planSubscriptionId: subscription.id },
    });

    return daysProgress ?? [];
  }
}
