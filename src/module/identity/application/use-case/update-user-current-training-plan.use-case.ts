import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';

@Injectable()
export class UpdateUserCurrentTrainingPlanUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TrainingPlanExistsApi)
    private readonly trainingPlanServiceClient: TrainingPlanExistsApi
  ) {}

  async execute(userId: string, trainingPlanId: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!(await this.trainingPlanServiceClient.traningPlanExists(trainingPlanId))) {
      throw new Error();
    }

    await this.userRepository.associateCurrentTrainingPlanToUser(userId, trainingPlanId);

    user.currentTrainingPlan = trainingPlanId;

    return user;
  }
}
