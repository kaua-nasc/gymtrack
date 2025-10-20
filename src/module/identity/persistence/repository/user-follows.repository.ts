import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { UserFollows } from '../entity/user-follows.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserFollowsRepository extends DefaultTypeOrmRepository<UserFollows> {
  constructor(@InjectDataSource('identity') dataSource: DataSource) {
    super(UserFollows, dataSource.manager);
  }
}
