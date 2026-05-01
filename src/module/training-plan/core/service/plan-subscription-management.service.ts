import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UserType } from '@src/module/identity/core/enum/user-type.enum';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { IdentityUserExistsApi } from '@src/module/shared/module/integration/interface/identity-integration.interface';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { PlanSubscriptionStatus } from '../../core/enum/plan-subscription-status.enum';
import { TrainingPlanManagementService } from '../../core/service/training-plan-management.service';
import { AssignPlanRequestDto } from '../../http/rest/dto/request/assign-plan-request.dto';
import { CreatePlanSubscriptionRequestDto } from '../../http/rest/dto/request/create-plan-subscription-request.dto';
import { PlanSubscription } from '../../persistence/entity/plan-subscription.entity';
import { PlanSubscriptionRepository } from '../../persistence/repository/plan-subscription.repository';
import { TrainingPlanVisibility } from '../enum/training-plan-visibility.enum';

@Injectable()
export class PlanSubscriptionManagementService {
  constructor(
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    private readonly trainingPlanManagementService: TrainingPlanManagementService,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async createSubscription(
    trainingPlanId: string,
    dto: CreatePlanSubscriptionRequestDto
  ) {
    const { id: userId } = this.request.user;

    this.logger.log('Subscribing user to training plan', {
      userId,
      trainingPlanId,
    });

    if (!(await this.trainingPlanManagementService.exists(trainingPlanId))) {
      throw new NotFoundException(
        `Training plan with ID '${trainingPlanId}' was not found.`
      );
    }

    if (!(await this.identityUserServiceClient.userExists(userId))) {
      throw new NotFoundException('user not found');
    }

    const existingSubscription = await this.planSubscriptionRepository.find({
      where: {
        userId,
        trainingPlanId,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('user already subscribed in this training plan');
    }

    const subscription = await this.planSubscriptionRepository.save(
      new PlanSubscription({
        userId,
        trainingPlanId,
        status: PlanSubscriptionStatus.notStarted,
        type: dto.type,
      })
    );

    return subscription;
  }

  async assignPlanToStudent(dto: AssignPlanRequestDto) {
    const { id: trainerId, type } = this.request.user;
    const { studentId, planId } = dto;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers can assign plans to students');
    }

    const trainingPlan = await this.trainingPlanManagementService.get(planId);
    if (!trainingPlan) {
      throw new NotFoundException(`Training plan with ID '${planId}' was not found.`);
    }

    if (trainingPlan.authorId !== trainerId) {
      throw new DomainException('you can only assign plans created by yourself');
    }

    const trainerOfStudentId =
      await this.identityUserServiceClient.getTrainerId(studentId);
    if (trainerOfStudentId !== trainerId) {
      throw new DomainException('this user is not your linked student');
    }

    const existingSubscription = await this.planSubscriptionRepository.find({
      where: {
        userId: studentId,
        trainingPlanId: dto.planId,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('student is already subscribed to this plan');
    }

    const sub = await this.planSubscriptionRepository.save(
      new PlanSubscription({
        userId: studentId,
        trainingPlanId: dto.planId,
        status: PlanSubscriptionStatus.notStarted,
        type: dto.type,
      })
    );

    return { subscriptionId: sub.id };
  }

  async removeSubscription(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    this.logger.log('Deleting subscription', { userId, trainingPlanId });

    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, trainingPlanId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Plan subscription with ID '${trainingPlanId}' was not found.`
      );
    }

    if (
      subscription.status === PlanSubscriptionStatus.inProgress ||
      subscription.status === PlanSubscriptionStatus.completed
    ) {
      throw new DomainException(
        `cannot delete a subscription with status ${subscription.status}`
      );
    }

    await this.planSubscriptionRepository.delete({ id: subscription.id });
  }

  async getInProgressSubscription() {
    const { id: userId } = this.request.user;
    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, status: PlanSubscriptionStatus.inProgress },
      relations: ['trainingPlan'],
    });
    if (!subscription) {
      throw new NotFoundException(
        `Plan subscription with status 'in-progress' was not found.`
      );
    }
    
    return subscription;
  }

  async getSubscriptions(userId = this.request.user.id) {
    const subscriptions = await this.planSubscriptionRepository.findMany({
      where: { userId },
      relations: ['trainingPlan', 'planDayProgress'],
    });

    if (userId !== this.request.user.id) {
      return subscriptions?.filter((s) => s.trainingPlan.visibility === TrainingPlanVisibility.public) ?? [];
    }
    return subscriptions ?? [];
  }

  async exists(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const sub = await this.planSubscriptionRepository.find({
      where: { userId, trainingPlanId },
    });
    return { exists: !!sub };
  }

  async existsInProgress(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const sub = await this.planSubscriptionRepository.find({
      where: { userId, trainingPlanId, status: PlanSubscriptionStatus.inProgress },
    });
    return { exists: !!sub };
  }

  async updateStatusToInProgress(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const subscription = await this.findSubscriptionOrThrow(userId, trainingPlanId);

    if (subscription.status !== PlanSubscriptionStatus.notStarted) {
      throw new DomainException('Subscription status must be "not started"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.inProgress }
    );
  }

  async updateStatusToFinished(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const subscription = await this.findSubscriptionOrThrow(userId, trainingPlanId);

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      throw new DomainException('Subscription status must be "in progress"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.completed }
    );
  }

  async updateStatusToCanceled(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const subscription = await this.findSubscriptionOrThrow(userId, trainingPlanId);

    if (subscription.status !== PlanSubscriptionStatus.inProgress) {
      throw new DomainException('Subscription status must be "in progress"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.canceled }
    );
  }

  async updateStatusToNotStarted(trainingPlanId: string) {
    const { id: userId } = this.request.user;
    const subscription = await this.findSubscriptionOrThrow(userId, trainingPlanId);

    if (subscription.status !== PlanSubscriptionStatus.canceled) {
      throw new DomainException('Subscription status must be "canceled"');
    }

    await this.planSubscriptionRepository.update(
      { id: subscription.id },
      { status: PlanSubscriptionStatus.notStarted }
    );
  }

  private async findSubscriptionOrThrow(userId: string, trainingPlanId: string) {
    const subscription = await this.planSubscriptionRepository.find({
      where: { userId, trainingPlanId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Plan subscription for training plan ${trainingPlanId} not found.`
      );
    }
    return subscription;
  }

  async createDayProgress(planSubscriptionId: string, dayId: string) {
    const { id: userId } = this.request.user;

    const sub = await this.planSubscriptionRepository.findOneById(planSubscriptionId);
    if (!sub || sub.userId !== userId)
      throw new NotFoundException(
        `Plan subscription for training plan ${planSubscriptionId} not found.`
      );

    if (sub.status !== PlanSubscriptionStatus.inProgress) {
      throw new NotFoundException('Plan subscription in progress not found.');
    }

    await this.planSubscriptionRepository.logDayProgress(planSubscriptionId, dayId);
  }

  async getDaysProgress() {
    const { id: userId } = this.request.user;
    const subs = await this.planSubscriptionRepository.findMany({
      where: { userId },
      relations: ['planDayProgress'],
    });
    return subs?.flatMap((s) => s.planDayProgress) ?? [];
  }
}
