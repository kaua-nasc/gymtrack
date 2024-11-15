import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { DomainException } from '@src/shared/core/exception/domain.exception';
import { hash } from 'bcrypt';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { BillingSubscriptionPlanTrainingPlanQuantityApi } from '@src/shared/module/integration/interface/billing-integration.interface';
import { TrainingPlanExistsApi } from '@src/shared/module/integration/interface/training-plan-integration.interface';

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
    @Inject(BillingSubscriptionPlanTrainingPlanQuantityApi)
    private readonly subscriptionPlanQuantityServiceClient: BillingSubscriptionPlanTrainingPlanQuantityApi,
    @Inject(BillingSubscriptionPlanTrainingPlanQuantityApi)
    private readonly trainingPlanServiceClient: TrainingPlanExistsApi
  ) {}
  async create(user: CreateUserDto) {
    const newUser = UserModel.create({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
      trainingPlanIds: [],
    });

    await this.userRepository.createUser({ ...newUser });

    return newUser;
  }

  async getUserById(id: string) {
    const userData = await this.userRepository.findOneBy({ id });

    if (!userData) throw new Error();

    const trainingPlanIds = userData.trainingPlans.map((values) => values.id);

    return UserModel.create({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      trainingPlanIds,
      createdAt: userData.createdAt,
      deletedAt: userData.deletedAt,
      id,
      updatedAt: userData.updatedAt,
    });
  }

  async associateTrainingPlan(userId: string, trainingPlanId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error();
    }

    //if (user.trainingPlans.includes(e => e. trainingPlanId)) {
    //throw new Error();
    //}

    if (!this.trainingPlanServiceClient.traningPlanExists(trainingPlanId)) {
      throw new Error();
    }

    const subscriptionPlanTrainingPlanMaxQuantity =
      await this.subscriptionPlanQuantityServiceClient.subscriptionPlanTrainingPlanQuantity(
        userId
      );

    //if (subscriptionPlanTrainingPlanMaxQuantity <= user.trainingPlanIds.length) {
    //throw new Error();
    //}

    //user.trainingPlanIds.push(trainingPlanId);

    this.userRepository.update(user.id, user);
  }
}
