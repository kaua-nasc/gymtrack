import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { hash } from 'bcrypt';
import { In } from 'typeorm';
import { UserChangeBioRequestDto } from '../../http/rest/dto/request/user-change-bio-request.dto';
import { UserPrivacySettingsRequestDto } from '../../http/rest/dto/request/user-privacy-settings-request.dto';
import { User } from '../../persistence/entity/user.entity';
import { UserFollows } from '../../persistence/entity/user-follows.entity';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserFollowsRepository } from '../../persistence/repository/user-follows.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';

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
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${user.email}`);
    if (await this.userRepository.findOneByEmail(user.email)) {
      this.logger.warn(`User creation failed: Email already in use: ${user.email}`);
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

    this.logger.log(`Successfully created user: ${newUser.id} for email: ${user.email}`);
    return newUser;
  }

  async getUserById(id: string): Promise<User> {
    this.logger.log(`Fetching user by ID: ${id}`);
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      this.logger.warn(`Failed to fetch user: User not found with ID: ${id}`);
      throw new NotFoundException('user not found');
    }

    if (user.profilePictureUrl) {
      this.logger.log(`Generating SAS URL for profile picture for user: ${id}`);
      user.profilePictureUrl = this.storageService.generateSasUrl(user.profilePictureUrl);
    }

    this.logger.log(`Successfully fetched user: ${id}`);
    return user;
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    console.log(`Fetching users by IDs: ${userIds}`);
    this.logger.log(`Fetching users by IDs: ${userIds}`);
    const users = await this.userRepository.findMany({
      where: { id: In([...new Set(userIds)]) },
    });

    if (!users || users.length === 0) {
      this.logger.warn(`Failed to fetch users: No users found with IDs: ${userIds}`);
      throw new NotFoundException('users not found');
    }

    return users;
  }

  async getUsers() {
    this.logger.log('Fetching all users with relations...');
    const users = await this.userRepository.findMany({
      relations: ['following', 'following.following', 'followers', 'followers.follower'],
    });

    if (!users || users.length === 0) {
      this.logger.log('No users found. Returning empty array.');
      return [];
    }

    this.logger.log(`Successfully fetched and mapped ${users.length} users.`);
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      following: user.following.map((f) => f.following),
      followers: user.followers.map((f) => f.follower),
    }));
  }

  async exists(): Promise<boolean> {
    const userId = this.request.user.id;

    this.logger.log(`Checking existence of user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    const exists = user ? true : false;
    this.logger.log(`User ${userId} existence check result: ${exists}`);
    return exists;
  }

  async existsById(userId: string): Promise<boolean> {
    this.logger.log(`Checking existence of user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    const exists = user ? true : false;
    this.logger.log(`User ${userId} existence check result: ${exists}`);
    return exists;
  }

  async followUser(followedId: string): Promise<void> {
    const userId = this.request.user.id;

    this.logger.log(`User ${userId} attempting to follow user ${followedId}`);
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      this.logger.warn(
        `Follow attempt failed: User ${userId} or ${followedId} not found.`
      );
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id, followingId: followedUser.id },
    });

    if (userFollows) {
      this.logger.warn(
        `Follow attempt failed: User ${userId} already follows ${followedId}.`
      );
      throw new BadRequestException('user already follow this user');
    }

    const following = new UserFollows({ followerId: userId, followingId: followedId });
    await this.userFollowsRepository.save(following);
    this.logger.log(`User ${userId} successfully followed ${followedId}`);
  }

  async unfollowUser(followedId: string): Promise<void> {
    const userId = this.request.user.id;

    this.logger.log(`User ${userId} attempting to unfollow user ${followedId}`);
    if (userId === followedId) {
      this.logger.warn(`Unfollow attempt failed: User ${userId} tried to unfollow self.`);
      throw new BadRequestException('userId and followedId cannot be equal');
    }
    const user = await this.userRepository.findOneById(userId);
    const followedUser = await this.userRepository.findOneById(followedId);
    if (user === null || followedUser === null) {
      this.logger.warn(
        `Unfollow attempt failed: User ${userId} or ${followedId} not found.`
      );
      throw new NotFoundException('user(s) not exists');
    }

    const userFollows = await this.userFollowsRepository.find({
      where: { followerId: user.id },
    });

    if (!userFollows) {
      this.logger.warn(
        `Unfollow attempt failed: User ${userId} does not follow ${followedId}.`
      );
      throw new BadRequestException('user not follow this user');
    }

    await this.userFollowsRepository.delete({
      followerId: user.id,
      followingId: followedUser.id,
    });
    this.logger.log(`User ${userId} successfully unfollowed ${followedId}`);
  }

  async countFollowing(userId: string): Promise<number> {
    this.logger.log(`Counting following for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Count following failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const count = await this.userFollowsRepository.count({
      followerId: user.id,
    });
    this.logger.log(`User ${userId} is following ${count} users.`);
    return count;
  }

  async countFollowers(userId: string): Promise<number> {
    this.logger.log(`Counting followers for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Count followers failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const count = await this.userFollowsRepository.count({
      followingId: user.id,
    });
    this.logger.log(`User ${userId} has ${count} followers.`);
    return count;
  }

  async getFollowing(userId: string): Promise<User[]> {
    this.logger.log(`Getting following list for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Get following failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { followers: { id: user.id } },
    });

    this.logger.log(
      `Successfully fetched ${users?.length ?? 0} following for user: ${userId}`
    );
    return users ?? [];
  }

  async getFollowers(userId: string) {
    this.logger.log(`Getting followers list for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Get followers failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const users = await this.userRepository.findMany({
      where: { following: { id: user.id } },
    });

    this.logger.log(
      `Successfully fetched ${users?.length ?? 0} followers for user: ${userId}`
    );
    return users ?? [];
  }

  async getPrivacyConfiguration(): Promise<UserPrivacySettings> {
    const userId = this.request.user.id;

    this.logger.log(`Getting privacy configuration for user: ${userId}`);
    const privacyConfiguration = await this.userPrivacySettingsRepository.find({
      where: { user: { id: userId } },
    });

    if (!privacyConfiguration) {
      this.logger.warn(`Get privacy configuration failed: Not found for user: ${userId}`);
      throw new NotFoundException('configuration not found');
    }

    this.logger.log(`Successfully fetched privacy configuration for user: ${userId}`);
    return privacyConfiguration;
  }

  async alterPrivacySettings(data: UserPrivacySettingsRequestDto): Promise<void> {
    const userId = this.request.user.id;

    this.logger.log(`Altering privacy settings for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Alter privacy settings failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const privacySettings = await this.userPrivacySettingsRepository.find({
      where: { user: { id: userId } },
    });

    if (!privacySettings) {
      this.logger.warn(
        `Alter privacy settings failed: Settings not found for user: ${userId}`
      );
      throw new NotFoundException('privacy settings not exists');
    }

    const newPrivacySettings = new UserPrivacySettings({ ...privacySettings, ...data });

    await this.userPrivacySettingsRepository.update(
      { user: { id: userId } },
      { ...newPrivacySettings }
    );
    this.logger.log(`Successfully altered privacy settings for user: ${userId}`);
  }

  async alterUserInformation(
    userId: string,
    data: UserChangeBioRequestDto
  ): Promise<void> {
    this.logger.log(`Altering user information for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Alter user information failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const changedUser = new User({
      ...user,
      ...data,
    });

    await this.userRepository.update({ id: userId }, { ...changedUser });
    this.logger.log(`Successfully altered user information for user: ${userId}`);
  }

  async changeProfile(file: Buffer): Promise<void> {
    const userId = this.request.user.id;

    this.logger.log(`User ${userId} attempting to change profile picture.`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Change profile failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${FilePath.profile}/user-${user.id}_${timestamp}.png`;

    this.logger.log(`Uploading new profile picture to ${filename} for user ${userId}.`);
    await this.storageService.upload(filename, file);

    if (user.profilePictureUrl) {
      this.logger.log(
        `Deleting old profile picture ${user.profilePictureUrl} for user ${userId}.`
      );
      await this.storageService.delete(user.profilePictureUrl);
    }

    await this.userRepository.update(
      { id: user.id },
      {
        ...user,
        profilePictureUrl: filename,
      }
    );
    this.logger.log(
      `Successfully changed profile picture for user ${userId}. New file: ${filename}`
    );
  }

  async removeProfile(): Promise<void> {
    const userId = this.request.user.id;

    this.logger.log(`User ${userId} attempting to remove profile picture.`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Remove profile failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    if (user.profilePictureUrl) {
      this.logger.log(
        `Deleting profile picture ${user.profilePictureUrl} for user ${userId}.`
      );
      await this.storageService.delete(user.profilePictureUrl);
    } else {
      this.logger.log(`User ${userId} had no profile picture to remove.`);
    }

    await this.userRepository.update(
      { id: user.id },
      {
        profilePictureUrl: undefined,
      }
    );
    this.logger.log(`Successfully removed profile picture for user ${userId}.`);
  }
}
