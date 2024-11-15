import { Inject, Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, DeepPartial } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(User, dataSource);
  }

  async createUser(user: DeepPartial<User>) {
    const created = this.create(user);

    await this.save(created);
  }
}
