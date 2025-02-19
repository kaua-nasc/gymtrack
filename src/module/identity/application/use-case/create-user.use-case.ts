import { Injectable } from '@nestjs/common';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { CreateUserDto } from '@src/module/identity/http/rest/dto/request/create-user-request.dto';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { hash } from 'bcrypt';

//TODO move to a configuration
export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userData: CreateUserDto) {
    const user = UserModel.create({
      ...userData,
      currentTrainingPlan: undefined,
      nextTrainingPlan: undefined,
      password: await hash(userData.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.saveUser(user);

    return user;
  }
}
