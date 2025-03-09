import { Inject, Injectable } from '@nestjs/common';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { DomainException } from '@src/shared/core/exception/domain.exception';
import { TrainingPlanCompleteApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class UpdateUserFinishCurrentTrainingPlanUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userManagementService: UserManagementService,
    @Inject(TrainingPlanCompleteApi)
    private readonly trainingPlanServiceClient: TrainingPlanCompleteApi
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!user.currentTrainingPlan) {
      throw new DomainException("user doesn't have a current training plan");
    }

    await this.trainingPlanServiceClient.completeTrainingPlan(
      user.id,
      user.currentTrainingPlan
    );

    this.userManagementService.transferNextTrainingPlanToCurrent(user);

    return user;
  }
}
