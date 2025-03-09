import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TrainingPlanExistsApi)
    private readonly trainingPlanServiceClient: TrainingPlanExistsApi
  ) {}

  transferNextTrainingPlanToCurrent(user: UserModel) {
    user.currentTrainingPlan = user.nextTrainingPlan;
    user.nextTrainingPlan = undefined;
  }

  addCurrentTrainingPlan(user: UserModel, trainingPlanId: string) {
    user.currentTrainingPlan = trainingPlanId;
  }
}
