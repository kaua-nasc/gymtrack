import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { UserType } from '../../core/enum/user-type.enum';
import { UserPrivacySettingsRequestDto } from '../../http/rest/dto/request/user-privacy-settings-request.dto';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { UserNotFoundException } from '../exception/user-not-found.exception';

@Injectable()
export class UserPrivacyService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async getPrivacyConfiguration(): Promise<UserPrivacySettings> {
    const userId = this.request.user.id;
    this.logger.log(`Fetching privacy configuration for user: ${userId}`);

    const settings = await this.userPrivacySettingsRepository.findOneByUserId(userId);
    if (!settings) {
      // Create default settings if not exists (should have been created on user creation)
      return new UserPrivacySettings({
        shareEmail: false,
        shareTrainingProgress: false,
        shareName: true,
      });
    }

    return settings;
  }

  async alterPrivacySettings(dto: UserPrivacySettingsRequestDto): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log(`Altering privacy settings for user: ${userId}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const settings = await this.userPrivacySettingsRepository.findOneByUserId(userId);

    const updatedSettings = new UserPrivacySettings({
      ...settings,
      ...dto,
      user,
    });

    await this.userPrivacySettingsRepository.save(updatedSettings);
    this.logger.log(`Successfully altered privacy settings for user: ${userId}`);
  }
}
