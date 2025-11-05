import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { User } from '../../persistence/entity/user.entity';
import { hash } from 'bcrypt';
import { UserFollowsRepository } from '../../persistence/repository/user-follows.repository';
import { UserFollows } from '../../persistence/entity/user-follows.entity';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';
import { UserPrivacySettingsRequestDto } from '../../http/rest/dto/request/user-privacy-settings-request.dto';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { UserChangeBioRequestDto } from '../../http/rest/dto/request/user-change-bio-request.dto';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFollowsRepository: UserFollowsRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    private readonly storageService: AzureStorageService,
    private readonly logger: AppLogger
  ) {}

  async create(user: CreateUserDto) {
    if (await this.userRepository.findOneByEmail(user.email)) {
      throw new ConflictException('email already in use');
    }
    const newUser = new User({
      ...user,
      password: await hash(user.password, PASSWORD_HASH_SALT),
    });

    await this.userRepository.save(newUser);

    const privacySettings = new UserPrivacySettings({
      shareEmail: false,
      shareTrainingProgress: false,
      shareName: true,
      user: newUser,
    });

    await this.userPrivacySettingsRepository.save(privacySettings);

    return newUser;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneById(id);

    if (!user) throw new NotFoundException('user not found');

    if (user.profilePictureUrl) {
      user.profilePictureUrl = await this.storageService.generateSasUrl(
        user.profilePictureUrl
      );
    }

    return user;
  }

  async getUsers() {
    const users = await this.userRepository.findMany({
      relations: ['following', 'following.following', 'followers', 'followers.follower'],
    });

    if (!users) return [];
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      following: user.following.map((f) => f.following),
      followers: user.followers.map((f) => f.follower),
    }));
  }

  async exists(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    return user ? true : false;
  }

  async followUser(userId: string, followedId: string) {
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id, followingId: followedUser.id },
    });

    if (userFollows) {
      throw new BadRequestException('user already follow this user');
    }

    const following = new UserFollows({ followerId: userId, followingId: followedId });
    await this.userFollowsRepository.save(following);
  }

  async unfollowUser(userId: string, followedId: string) {
    if (userId === followedId) {
      throw new BadRequestException('userId and followedId cannot be equal');
    }
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id },
    });

    if (!userFollows) {
      throw new BadRequestException('user not follow this user');
    }

    await this.userFollowsRepository.delete({
      followerId: user.id,
      followingId: followedUser.id,
    });
  }

  async countFollowing(userId: string): Promise<number> {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    return await this.userFollowsRepository.count({
      followerId: user.id,
    });
  }

  async countFollowers(userId: string): Promise<number> {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    return await this.userFollowsRepository.count({
      followingId: user.id,
    });
  }

  async getFollowing(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { followers: { id: user.id } },
    });

    return users ?? [];
  }

  async getFollowers(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { following: { id: user.id } },
    });

    return users ?? [];
  }

  async getPrivacyConfiguration(userId: string) {
    const privacyConfiguration = await this.userPrivacySettingsRepository.find({
      where: { user: { id: userId } },
    });

    if (privacyConfiguration == null) {
      throw new NotFoundException('configuration not found');
    }

    return privacyConfiguration;
  }

  async alterPrivacySettings(userId: string, data: UserPrivacySettingsRequestDto) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const privacySettings = await this.userPrivacySettingsRepository.find({
      where: { user: { id: userId } },
    });
    if (privacySettings == null) {
      throw new NotFoundException('privacy settings not exists');
    }

    const newPrivacySettings = new UserPrivacySettings({ ...privacySettings, ...data });

    await this.userPrivacySettingsRepository.update(
      { user: { id: userId } },
      { ...newPrivacySettings }
    );
  }

  async alterUserInformation(userId: string, data: UserChangeBioRequestDto) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const changedUser = new User({
      ...user,
      ...data,
    });

    await this.userRepository.update({ id: userId }, { ...changedUser });
  }

  async changeProfile(userId: string, file: Buffer) {
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      throw new NotFoundException('user not exists');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${FilePath.profile}/user-${user.id}_${timestamp}.png`;

    await this.storageService.upload(filename, file);

    await this.userRepository.update(
      { id: user.id },
      {
        ...user,
        profilePictureUrl: filename,
      }
    );
  }
}
