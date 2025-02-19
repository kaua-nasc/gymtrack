import { Injectable } from '@nestjs/common';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    return await this.userRepository.findUserById(id);
  }
}
