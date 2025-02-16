import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';
import { hash } from 'bcrypt';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

//TODO move to a configuration
export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TrainingPlanExistsApi)
    private readonly trainingPlanServiceClient: TrainingPlanExistsApi
  ) {}
  async create(user: CreateUserDto) {
    const newUser = UserModel.create({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.saveUser({ ...newUser });

    return newUser;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUserById(id);

    if (!user) throw new Error();

    return UserModel.create({ ...user, id });
  }

  async associateCurrentTrainingPlan(userId: string, trainingPlanId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!(await this.trainingPlanServiceClient.traningPlanExists(trainingPlanId))) {
      throw new Error();
    }

    await this.userRepository.associateCurrentTrainingPlanToUser(userId, trainingPlanId);

    user.currentTrainingPlan = trainingPlanId;

    return user;
  }

  async associateNextTrainingPlan(userId: string, trainingPlanId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!(await this.trainingPlanServiceClient.traningPlanExists(trainingPlanId))) {
      throw new Error();
    }

    await this.userRepository.associateNextTrainingPlanToUser(userId, trainingPlanId);

    user.nextTrainingPlan = trainingPlanId;

    return user;
  }
}
