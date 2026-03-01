import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserPrivacySettings } from '../entity/user-privacy-settings.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

@Injectable()
export class UserPrivacySettingsRepository extends DefaultTypeOrmRepository<UserPrivacySettings> {
  constructor(
    @InjectDataSource('identity') dataSource: DataSource,
    logger: AppLogger
  ) {
    super(UserPrivacySettings, dataSource.manager, logger);
  }

  async findOneByUserId(userId: string): Promise<UserPrivacySettings | null> {
    return this.find({
      where: { user: { id: userId } },
    });
  }

  async updateByUserId(userId: string, data: QueryDeepPartialEntity<UserPrivacySettings>): Promise<void> {
    await this.update({ user: { id: userId } }, data);
  }
}
