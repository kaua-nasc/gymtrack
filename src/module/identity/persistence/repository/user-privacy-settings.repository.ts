import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserPrivacySettings } from '../entity/user-privacy-settings.entity';

@Injectable()
export class UserPrivacySettingsRepository extends DefaultTypeOrmRepository<UserPrivacySettings> {
  constructor(@InjectDataSource('identity') dataSource: DataSource) {
    super(UserPrivacySettings, dataSource.manager);
  }
}
