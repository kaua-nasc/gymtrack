import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { User } from '../../persistence/entity/user.entity';
import { hash } from 'bcrypt';
import { TrainingPlanExistsApi } from '@src/module/shared/module/integration/interface/training-plan-integration.interface';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TrainingPlanExistsApi)
    private readonly trainingPlanServiceClient: TrainingPlanExistsApi
  ) {}

  async create(user: CreateUserDto) {
    if (await this.userRepository.findOneByEmail(user.email)) {
      throw new ConflictException('email already in use');
    }
    const newUser = new User({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneById(id);

    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async getUsers() {
    return this.userRepository.findMany({});
  }

  async addNewActualTrainingPlan(userId: string, trainingPlanId: string) {
    if (!(await this.userRepository.findOneById(userId))) {
      throw new NotFoundException('user not found');
    }

    if (!(await this.trainingPlanServiceClient.traningPlanExists(trainingPlanId))) {
      throw new NotFoundException('training plan not found');
    }

    await this.userRepository.update(
      { id: userId },
      { actualTrainingPlan: trainingPlanId }
    );
  }
}
