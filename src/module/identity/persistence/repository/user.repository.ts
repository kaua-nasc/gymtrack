import { Injectable } from '@nestjs/common';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { User } from '@src/module/identity/persistence/entity/user.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(User, transactionalEntityManager);
  }

  async findOneBy(email: string) {
    return await super.find({ where: { email } });
  }

  async findUserById(id: string) {
    const user = await super.findOneById(id);

    if (!user) {
      throw new Error();
    }

    return UserModel.create({ ...user });
  }

  async saveUser(entity: UserModel) {
    const user = new User({ ...entity });

    await super.save(user);
  }

  async associateCurrentTrainingPlanToUser(userId: string, trainingPlanId: string) {
    await this.update({ id: userId }, { currentTrainingPlan: trainingPlanId });
  }

  async associateNextTrainingPlanToUser(userId: string, trainingPlanId: string) {
    await this.update({ id: userId }, { nextTrainingPlan: trainingPlanId });
  }

  async updateUser(userId: string, entity: Partial<UserModel>) {
    return await this.update({ id: userId }, { ...entity });
  }
}
