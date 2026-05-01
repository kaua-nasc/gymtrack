import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { DataSource, In } from 'typeorm';
import { UserType } from '../../core/enum/user-type.enum';
import { UserChangeBioRequestDto } from '../../http/rest/dto/request/user-change-bio-request.dto';
import { TrainerStudentRelationship } from '../../persistence/entity/trainer-student-relationship.entity';
import { User } from '../../persistence/entity/user.entity';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { hashPassword } from '../util/password.util';
import { AuthService } from './authentication.service';
import { UserFollowsService } from './user-follows.service';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type?: UserType;
}

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    @InjectDataSource('identity') private readonly dataSource: DataSource,
    private readonly storageService: AzureStorageService,
    private readonly logger: AppLogger,
    private readonly authService: AuthService,
    private readonly userFollowsService: UserFollowsService,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${user.email}`);
    if (await this.userRepository.findOneByEmail(user.email)) {
      this.logger.warn(`User creation failed: Email already in use: ${user.email}`);
      throw new ConflictException(`The email '${user.email}' is already in use.`);
    }
    const newUser = new User({
      ...user,
      type: user.type ?? UserType.client,
      password: await hashPassword(user.password),
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

  async upgradeToPersonalTrainer(cref: string): Promise<{ accessToken: string }> {
    const userId = this.request.user.id;
    this.logger.log(`Upgrading user ${userId} to personal trainer with CREF: ${cref}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
            throw new NotFoundException(`User with identifier '${userId}' was not found.`);
    }

    if (user.type === UserType.personalTrainer) {
      this.logger.warn(`User ${userId} is already a personal trainer`);
      return this.authService.generateToken(user);
    }

    const existing = await this.userRepository.find({ where: { cref } });
    if (existing && existing.id !== userId) {
      throw new ConflictException(`The CREF '${cref}' is already in use.`);
    }

    await this.userRepository.update(
      { id: userId },
      {
        type: UserType.personalTrainer,
        cref,
        isVerified: true,
      }
    );
    this.logger.log(`User ${userId} successfully upgraded to personal trainer`);

    const updatedUser = await this.userRepository.findOneById(userId);
    return this.authService.generateToken(updatedUser!);
  }

  async downgradeToClient(): Promise<{ accessToken: string }> {
    const userId = this.request.user.id;
    this.logger.log(`Downgrading user ${userId} to client`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with identifier '${userId}' was not found.`);
    }

    if (user.type === UserType.client) {
      this.logger.warn(`User ${userId} is already a client`);
      return this.authService.generateToken(user);
    }

    await this.dataSource.transaction(async (manager) => {
      // Clear all students relationships if this trainer had any
      await manager.delete(TrainerStudentRelationship, { trainerId: userId });

      await manager.update(
        User,
        { id: userId },
        {
          type: UserType.client,
          isVerified: false,
        }
      );
    });

    this.logger.log(`User ${userId} successfully downgraded to client`);

    const updatedUser = await this.userRepository.findOneById(userId);
    return this.authService.generateToken(updatedUser!);
  }

  async getUserById(id: string) {
    const userId = this.request.user.id;

    this.logger.log(`Fetching user by ID: ${id}`);
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      this.logger.warn(`Failed to fetch user: User not found with ID: ${id}`);
      throw new NotFoundException(`User with identifier '${id}' was not found.`);
    }

    if (user.profilePictureUrl) {
      this.logger.log(`Generating URL for profile picture for user: ${id}`);
      user.profilePictureUrl = this.storageService.generateUrl(user.profilePictureUrl);
    }

    this.logger.log(`Successfully fetched user: ${id}`);
    return {
      ...user,
      isFollowing: await this.userFollowsService.isFollowing(userId, id),
    };
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    this.logger.log(`Fetching users by IDs: ${userIds}`);
    const users = await this.userRepository.findMany({
      where: { id: In([...new Set(userIds)]) },
    });

    if (!users || users.length === 0) {
      this.logger.warn(`Failed to fetch users: No users found with IDs: ${userIds}`);
      throw new NotFoundException(`Users with identifiers '${userIds.join(', ')}' were not found.`);
    }

    return users;
  }

  async getUsers() {
    this.logger.log('Fetching all users with relations...');
    const users =
      (await this.userRepository.findMany({
        relations: ['following', 'followers'],
      })) ?? [];

    this.logger.log(`Successfully fetched ${users.length} users.`);
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      following: user.following.map((f) => f.following),
      followers: user.followers.map((f) => f.follower),
    }));
  }

  async existsById(userId: string): Promise<boolean> {
    this.logger.log(`Checking existence of user: ${userId}`);
    const exists = await this.userRepository.exists(userId);
    this.logger.log(`User ${userId} existence check result: ${exists}`);
    return exists;
  }

  async alterUserInformation(
    userId: string,
    data: UserChangeBioRequestDto
  ): Promise<void> {
    this.logger.log(`Altering user information for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Alter user information failed: User not found: ${userId}`);
      throw new NotFoundException(`User with identifier '${userId}' was not found.`);
    }

    let isVerified = user.isVerified;
    if (data.cref && data.cref !== user.cref) {
      this.logger.log(`CREF changed for user ${userId}. Resetting verification status.`);
      const existing = await this.userRepository.find({ where: { cref: data.cref } });
      if (existing && existing.id !== userId) {
        throw new DomainException('CREF already in use');
      }
      isVerified = false;
    }

    const changedUser = new User({
      ...user,
      ...data,
      isVerified,
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
      throw new NotFoundException(`User with identifier '${userId}' was not found.`);
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
      throw new NotFoundException(`User with identifier '${userId}' was not found.`);
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

  async getTrainerOfStudent(studentId: string): Promise<User | null> {
    this.logger.log(`Fetching trainer for student ID: ${studentId}`);
    const relationship = await this.dataSource
      .getRepository(TrainerStudentRelationship)
      .findOne({ where: { studentId }, relations: ['trainer'] });

    if (!relationship) {
      this.logger.warn(`No trainer found for student ID: ${studentId}`);
      return null;
    }

    this.logger.log(`Successfully fetched trainer for student ID: ${studentId}`);
    return relationship.trainer;
  }
}
