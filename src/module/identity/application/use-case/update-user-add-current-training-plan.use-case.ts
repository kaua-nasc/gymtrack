import { Inject, Injectable } from '@nestjs/common';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import {
  TrainingPlanExistsApi,
  TrainingPlanUpdateToInProgressApi,
} from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class UpdateUserAddCurrentTrainingPlanUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userManagementService: UserManagementService,
    @Inject(TrainingPlanExistsApi)
    private readonly trainingPlanExistsServiceClient: TrainingPlanExistsApi,
    @Inject(TrainingPlanUpdateToInProgressApi)
    private readonly trainingPlanUpdateToInProgressApiServiceClient: TrainingPlanUpdateToInProgressApi
  ) {}

  async execute(userId: string, trainingPlanId: string) {
    const user = await this.userRepository.findUserById(userId);

    //if (!(await this.trainingPlanExistsServiceClient.traningPlanExists(trainingPlanId))) {
    //  throw new NotFoundException("this training plan doesn't exists");
    //}

    //if (!user.currentTrainingPlan) {
    //  throw new DomainException("user doesn't have a current training plan");
    //}

    this.userManagementService.addCurrentTrainingPlan(user, trainingPlanId);

    await this.trainingPlanUpdateToInProgressApiServiceClient.updateToInProgressTrainingPlan(
      user.id,
      user.currentTrainingPlan!
    );

    return user;
  }
}
