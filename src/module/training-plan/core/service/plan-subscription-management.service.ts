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

@Injectable()
export class PlanSubscriptionManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly planSubscriptionRepository: PlanSubscriptionRepository,
    @Inject(IdentityUserExistsApi)
    private readonly identityUserServiceClient: IdentityUserExistsApi
  ) {}
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
        'Subscription status must be "not started" or "cancelled".'
      );
    }

    await this.planSubscriptionRepository.remove(subscription);
  }
}
