import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, data: { email?: string; firstName?: string }) {
    return await this.userRepository.updateUser(userId, { ...data });
  }
}
