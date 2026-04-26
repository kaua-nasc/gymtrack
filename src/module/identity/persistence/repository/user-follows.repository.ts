import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { UserFollows } from '../entity/user-follows.entity';

@Injectable()
export class UserFollowsRepository extends DefaultTypeOrmRepository<UserFollows> {
  constructor(@InjectDataSource('identity') dataSource: DataSource, logger: AppLogger) {
    super(UserFollows, dataSource.manager, logger);
  }

  async findOneByFollowerAndFollowing(
    followerId: string,
    followingId: string
  ): Promise<UserFollows | null> {
    return this.find({
      where: { followerId, followingId },
    });
  }

  async countFollowing(followerId: string): Promise<number> {
    return this.count({ followerId });
  }

  async countFollowers(followingId: string): Promise<number> {
    return this.count({ followingId });
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await this.delete({ followerId, followingId });
  }
}
