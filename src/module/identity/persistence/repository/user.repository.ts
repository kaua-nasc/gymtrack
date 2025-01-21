import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';
import { User } from '@src/module/identity/persistence/entity/user.entity';
import { UserModel } from '@src/module/identity/core/model/user.model';

@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(User, transactionalEntityManager);
  }

  async findOneBy(email: string) {
    return await super.find({ where: { email } });
  }

  async findOneById(id: string) {
    return await super.findOneById(id);
  }

  async saveUser(entity: UserModel) {
    const user = new User({ ...entity });

    await super.save(user);
  }
}
