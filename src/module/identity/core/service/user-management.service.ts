import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { FilePath } from '@src/module/shared/module/storage/enum/file-path.enum';
import { AzureStorageService } from '@src/module/shared/module/storage/service/azure-storage.service';
import { hash } from 'bcrypt';
import { DataSource, EntityManager, In } from 'typeorm';
import { HeightUnit } from '../../core/enum/height-unit.enum';
import { MeasurementType } from '../../core/enum/measurement-type.enum';
import { MetricGoalStatus } from '../../core/enum/metric-goal-status.enum';
import { UserType } from '../../core/enum/user-type.enum';
import { WeightUnit } from '../../core/enum/weight-unit.enum';
import { AddBodyMeasurementsRequestDto } from '../../http/rest/dto/request/add-body-measurements-request.dto';
import { AddWeightLogRequestDto } from '../../http/rest/dto/request/add-weight-log-request.dto';
import { CreateMetricGoalRequestDto } from '../../http/rest/dto/request/create-metric-goal-request.dto';
import { UpdateMetricGoalStatusRequestDto } from '../../http/rest/dto/request/update-metric-goal-status-request.dto';
import { UpdateUserMetricsRequestDto } from '../../http/rest/dto/request/update-user-metrics-request.dto';
import { UserChangeBioRequestDto } from '../../http/rest/dto/request/user-change-bio-request.dto';
import { UserPrivacySettingsRequestDto } from '../../http/rest/dto/request/user-privacy-settings-request.dto';
import { BodyMeasurement } from '../../persistence/entity/body-measurement.entity';
import { MetricGoal } from '../../persistence/entity/metric-goal.entity';
import { User } from '../../persistence/entity/user.entity';
import { UserFollows } from '../../persistence/entity/user-follows.entity';
import { UserPrivacySettings } from '../../persistence/entity/user-privacy-settings.entity';
import { WeightLog } from '../../persistence/entity/weight-log.entity';
import { BodyMeasurementRepository } from '../../persistence/repository/body-measurement.repository';
import { MetricGoalRepository } from '../../persistence/repository/metric-goal.repository';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserFollowsRepository } from '../../persistence/repository/user-follows.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { WeightLogRepository } from '../../persistence/repository/weight-log.repository';
import { TrainerStudentRelationshipRepository } from '../../persistence/repository/trainer-student-relationship.repository';
import { TrainerStudentRelationship } from '../../persistence/entity/trainer-student-relationship.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type?: UserType;
}

export const PASSWORD_HASH_SALT = 10;

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFollowsRepository: UserFollowsRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    private readonly weightLogRepository: WeightLogRepository,
    private readonly bodyMeasurementRepository: BodyMeasurementRepository,
    private readonly metricGoalRepository: MetricGoalRepository,
    private readonly trainerStudentRelationshipRepository: TrainerStudentRelationshipRepository,
    @InjectDataSource('identity') private readonly dataSource: DataSource,
    private readonly storageService: AzureStorageService,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${user.email}`);
    if (await this.userRepository.findOneByEmail(user.email)) {
      this.logger.warn(`User creation failed: Email already in use: ${user.email}`);
      throw new ConflictException('email already in use');
    }
    const newUser = new User({
      ...user,
      type: user.type ?? UserType.client,
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

  async upgradeToPersonalTrainer(): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log(`Upgrading user ${userId} to personal trainer`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (user.type === UserType.personalTrainer) {
      this.logger.warn(`User ${userId} is already a personal trainer`);
      return;
    }

    await this.userRepository.update({ id: userId }, { type: UserType.personalTrainer });
    this.logger.log(`User ${userId} successfully upgraded to personal trainer`);
  }

  async getUserById(id: string): Promise<User> {
    this.logger.log(`Fetching user by ID: ${id}`);
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      this.logger.warn(`Failed to fetch user: User not found with ID: ${id}`);
      throw new NotFoundException('user not found');
    }

    if (user.profilePictureUrl) {
      this.logger.log(`Generating URL for profile picture for user: ${id}`);
      user.profilePictureUrl = this.storageService.generateUrl(user.profilePictureUrl);
    }

    this.logger.log(`Successfully fetched user: ${id}`);
    return user;
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
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
    const users = await this.userRepository.findManyWithFollows();

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

  async existsById(userId: string): Promise<boolean> {
    this.logger.log(`Checking existence of user: ${userId}`);
    const exists = await this.userRepository.exists(userId);
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

    const userFollows = await this.userFollowsRepository.findOneByFollowerAndFollowing(
      user.id,
      followedUser.id
    );

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

    const userFollows = await this.userFollowsRepository.findOneByFollowerAndFollowing(
      user.id,
      followedUser.id
    );

    if (!userFollows) {
      this.logger.warn(
        `Unfollow attempt failed: User ${userId} does not follow ${followedId}.`
      );
      throw new BadRequestException('user not follow this user');
    }

    await this.userFollowsRepository.deleteFollow(user.id, followedUser.id);
    this.logger.log(`User ${userId} successfully unfollowed ${followedId}`);
  }

  async countFollowing(userId: string): Promise<number> {
    this.logger.log(`Counting following for user: ${userId}`);
    const user = await this.userRepository.findOneById(userId);
    if (user === null) {
      this.logger.warn(`Count following failed: User not found: ${userId}`);
      throw new NotFoundException('user not exists');
    }

    const count = await this.userFollowsRepository.countFollowing(user.id);
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

    const count = await this.userFollowsRepository.countFollowers(user.id);
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

    const users = await this.userRepository.findFollowingByUserId(user.id);

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

    const users = await this.userRepository.findFollowersByUserId(user.id);

    this.logger.log(
      `Successfully fetched ${users?.length ?? 0} followers for user: ${userId}`
    );
    return users ?? [];
  }

  async getPrivacyConfiguration(): Promise<UserPrivacySettings> {
    const userId = this.request.user.id;

    this.logger.log(`Getting privacy configuration for user: ${userId}`);
    const privacyConfiguration =
      await this.userPrivacySettingsRepository.findOneByUserId(userId);

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

    const privacySettings =
      await this.userPrivacySettingsRepository.findOneByUserId(userId);

    if (!privacySettings) {
      this.logger.warn(
        `Alter privacy settings failed: Settings not found for user: ${userId}`
      );
      throw new NotFoundException('privacy settings not exists');
    }

    const newPrivacySettings = new UserPrivacySettings({ ...privacySettings, ...data });

    await this.userPrivacySettingsRepository.updateByUserId(userId, {
      ...newPrivacySettings,
    });
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

  async updateMetrics(dto: UpdateUserMetricsRequestDto): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log(`Updating metrics for user: ${userId}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (dto.height !== undefined) {
      user.height = this.convertToMetricHeight(
        dto.height,
        dto.heightUnit || user.heightUnit
      );
    }

    if (dto.currentWeight !== undefined) {
      user.currentWeight = this.convertToMetricWeight(
        dto.currentWeight,
        dto.weightUnit || user.weightUnit
      );
    }

    if (dto.weightUnit) {
      user.weightUnit = dto.weightUnit;
    }

    if (dto.heightUnit) {
      user.heightUnit = dto.heightUnit;
    }

    await this.userRepository.save(user);
    this.logger.log(`Successfully updated metrics for user: ${userId}`);
  }

  async addWeightLog(dto: AddWeightLogRequestDto): Promise<WeightLog> {
    const userId = this.request.user.id;
    this.logger.log(`Adding weight log for user: ${userId}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const weightInMetric = this.convertToMetricWeight(dto.weight, user.weightUnit);

    return await this.dataSource.transaction(async (manager) => {
      const log = new WeightLog({
        userId,
        weight: weightInMetric,
        measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
      });

      const savedLog = await manager.save(WeightLog, log);

      user.currentWeight = weightInMetric;
      await manager.save(user);

      await this.checkMetricGoals(userId, 'WEIGHT', weightInMetric, manager);

      return savedLog;
    });
  }

  async getWeightHistory(
    page = 1,
    limit = 20
  ): Promise<{ items: WeightLog[]; total: number }> {
    const userId = this.request.user.id;
    this.logger.log(`Fetching weight history for user: ${userId}`);

    const [items, total] = await this.weightLogRepository.findAndCountByUserId(
      userId,
      page,
      limit
    );

    return { items, total };
  }

  async addBodyMeasurements(
    dto: AddBodyMeasurementsRequestDto
  ): Promise<BodyMeasurement[]> {
    const userId = this.request.user.id;
    this.logger.log(`Adding body measurements for user: ${userId}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const measuredAt = dto.measuredAt ? new Date(dto.measuredAt) : new Date();

    return await this.dataSource.transaction(async (manager) => {
      const savedMeasurements: BodyMeasurement[] = [];

      for (const entry of dto.measurements) {
        const valueInMetric = this.convertToMetricValue(entry.type, entry.value, user);

        const measurement = new BodyMeasurement({
          userId,
          type: entry.type,
          value: valueInMetric,
          measuredAt,
        });

        const saved = await manager.save(BodyMeasurement, measurement);
        savedMeasurements.push(saved);

        await this.checkMetricGoals(userId, entry.type, valueInMetric, manager);
      }

      return savedMeasurements;
    });
  }

  async getBodyMeasurementsHistory(
    type?: MeasurementType,
    page = 1,
    limit = 20
  ): Promise<{ items: BodyMeasurement[]; total: number }> {
    const userId = this.request.user.id;
    this.logger.log(`Fetching body measurements history for user: ${userId}`);

    const [items, total] = await this.bodyMeasurementRepository.findAndCountByUserId(
      userId,
      type,
      page,
      limit
    );

    return { items, total };
  }

  async getLatestBodyMeasurements(): Promise<BodyMeasurement[]> {
    const userId = this.request.user.id;
    this.logger.log(`Fetching latest body measurements for user: ${userId}`);

    return await this.bodyMeasurementRepository.findLatestByUserId(userId);
  }

  async createMetricGoal(dto: CreateMetricGoalRequestDto): Promise<MetricGoal> {
    const userId = this.request.user.id;
    this.logger.log(`Creating metric goal for user: ${userId}, type: ${dto.type}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('user not found');

    let startingValue: number;
    if (dto.type === 'WEIGHT') {
      startingValue = user.currentWeight || 0;
    } else {
      const latest = await this.bodyMeasurementRepository.findAndCountByUserId(
        userId,
        dto.type as MeasurementType,
        1,
        1
      );
      startingValue = latest[0][0]?.value || 0;
    }

    const goal = new MetricGoal({
      userId,
      type: dto.type,
      startingValue,
      targetValue: dto.targetValue,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      status: MetricGoalStatus.ACTIVE,
    });

    return await this.metricGoalRepository.save(goal);
  }

  async getMetricGoals(): Promise<(MetricGoal & { progress: number })[]> {
    const userId = this.request.user.id;
    this.logger.log(`Fetching metric goals for user: ${userId}`);

    const goals = await this.metricGoalRepository.findAllByUserId(userId);
    const user = await this.userRepository.findOneById(userId);

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let currentValue: number;
        if (goal.type === 'WEIGHT') {
          currentValue = user?.currentWeight || goal.startingValue;
        } else {
          const latest = await this.bodyMeasurementRepository.findAndCountByUserId(
            userId,
            goal.type as MeasurementType,
            1,
            1
          );
          currentValue = latest[0][0]?.value || goal.startingValue;
        }

        let progress = 0;
        if (goal.status === MetricGoalStatus.ACHIEVED) {
          progress = 1;
        } else if (goal.status === MetricGoalStatus.ACTIVE) {
          const totalDistance = goal.targetValue - goal.startingValue;
          const currentDistance = currentValue - goal.startingValue;

          if (totalDistance === 0) {
            progress = currentValue === goal.targetValue ? 1 : 0;
          } else {
            progress = Number((currentDistance / totalDistance).toFixed(2));
            progress = Math.max(0, Math.min(1, progress));
          }
        }

        return Object.assign(goal, { progress });
      })
    );

    return goalsWithProgress;
  }

  async updateMetricGoalStatus(
    id: string,
    dto: UpdateMetricGoalStatusRequestDto
  ): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log(`Updating metric goal status: ${id} to ${dto.status}`);

    const goal = await this.metricGoalRepository.findOneById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('goal not found');
    }

    await this.metricGoalRepository.update({ id }, { status: dto.status });
  }

  async updateTrainerInviteCode(inviteCode: string): Promise<void> {
    const { id: userId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new BadRequestException('only personal trainers can have invite codes');
    }

    this.logger.log(`Updating invite code for trainer ${userId} to ${inviteCode}`);

    const existing = await this.userRepository.findByInviteCode(inviteCode);
    if (existing && existing.id !== userId) {
      throw new ConflictException('invite code already in use');
    }

    await this.userRepository.update({ id: userId }, { trainerInviteCode: inviteCode });
  }

  async getTrainerInviteCode(): Promise<string | undefined> {
    const { id: userId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new BadRequestException('only personal trainers have invite codes');
    }

    const user = await this.userRepository.findOneById(userId);
    return user?.trainerInviteCode;
  }

  async linkTrainer(inviteCode: string): Promise<void> {
    const { id: studentId } = this.request.user;
    this.logger.log(`Student ${studentId} attempting to link with code ${inviteCode}`);

    const trainer = await this.userRepository.findByInviteCode(inviteCode);
    if (!trainer || trainer.type !== UserType.personalTrainer) {
      throw new NotFoundException('trainer not found with this code');
    }

    const existingRelationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(studentId);
    if (existingRelationship) {
      throw new BadRequestException('student already has a linked trainer');
    }

    const relationship = new TrainerStudentRelationship({
      trainerId: trainer.id,
      studentId,
    });

    await this.trainerStudentRelationshipRepository.save(relationship);
    this.logger.log(`Successfully linked student ${studentId} to trainer ${trainer.id}`);

    // Auto-follow side effect
    try {
      await this.followUser(trainer.id);
    } catch (e) {
      this.logger.warn(`Auto-follow failed during linking: ${e.message}`);
    }
  }

  async unlinkTrainer(): Promise<void> {
    const { id: userId, type } = this.request.user;
    this.logger.log(`Attempting to unlink relationship for user ${userId}`);

    if (type === UserType.personalTrainer) {
      // If trainer, we need to know which student to unlink. 
      // For now, let's keep it simple: the student must initiate or we need a studentId param.
      // Based on design "Both can end", adding a param-less version for student 
      // and we'll add a param version for trainer if needed.
      throw new BadRequestException('trainer must specify studentId to unlink (not implemented yet)');
    }

    const relationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(userId);
    if (!relationship) {
      throw new NotFoundException('no relationship found to unlink');
    }

    await this.trainerStudentRelationshipRepository.deleteRelationship(
      relationship.trainerId,
      userId
    );
    this.logger.log(`Successfully unlinked student ${userId} from trainer ${relationship.trainerId}`);
  }

  async unlinkStudent(studentId: string): Promise<void> {
    const { id: trainerId, type } = this.request.user;
    if (type !== UserType.personalTrainer) {
      throw new BadRequestException('only trainers can unlink students this way');
    }

    await this.trainerStudentRelationshipRepository.deleteRelationship(trainerId, studentId);
    this.logger.log(`Successfully unlinked student ${studentId} from trainer ${trainerId}`);
  }

  async getStudents(): Promise<User[]> {
    const { id: trainerId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new BadRequestException('only personal trainers can list students');
    }

    const relationships =
      await this.trainerStudentRelationshipRepository.findByTrainerId(trainerId);
    return relationships.map((r) => r.student);
  }

  async getTrainer(): Promise<User | null> {
    const { id: studentId } = this.request.user;
    return await this.getTrainerOfStudent(studentId);
  }

  async getTrainerOfStudent(studentId: string): Promise<User | null> {
    const relationship =
      await this.trainerStudentRelationshipRepository.findByStudentId(studentId);
    if (!relationship) return null;

    return await this.userRepository.findOneById(relationship.trainerId);
  }

  async getTrainerIdByStudentId(studentId: string): Promise<string | null> {
    const trainer = await this.getTrainerOfStudent(studentId);
    return trainer?.id ?? null;
  }

  private async checkMetricGoals(
    userId: string,
    type: string,
    newValue: number,
    manager: EntityManager
  ): Promise<void> {
    const activeGoals = await manager.find(MetricGoal, {
      where: { userId, type, status: MetricGoalStatus.ACTIVE },
    });

    for (const goal of activeGoals) {
      const isDecrease = goal.targetValue < goal.startingValue;
      const isIncrease = goal.targetValue > goal.startingValue;

      let achieved = false;
      if (isDecrease && newValue <= goal.targetValue) achieved = true;
      else if (isIncrease && newValue >= goal.targetValue) achieved = true;
      else if (!isIncrease && !isDecrease && newValue === goal.targetValue)
        achieved = true;

      if (achieved) {
        this.logger.log(`Goal achieved! User: ${userId}, Goal: ${goal.id}`);
        await manager.update(
          MetricGoal,
          { id: goal.id },
          {
            status: MetricGoalStatus.ACHIEVED,
            achievedAt: new Date(),
          }
        );
      }
    }
  }

  private convertToMetricValue(type: MeasurementType, value: number, user: User): number {
    const compositionMetrics = [
      // MeasurementType.BODY_FAT,
      MeasurementType.WATER_PERCENTAGE,
    ];

    const massMetrics = [MeasurementType.MUSCLE_MASS, MeasurementType.BONE_MASS];

    if (compositionMetrics.includes(type)) {
      return Number(value.toFixed(2)); // Percentages stay the same
    }

    if (massMetrics.includes(type)) {
      return this.convertToMetricWeight(value, user.weightUnit);
    }

    // Default is length (circumferences and limbs)
    return this.convertToMetricHeight(value, user.heightUnit);
  }

  private convertToMetricWeight(weight: number, unit: WeightUnit): number {
    if (unit === WeightUnit.lb) {
      return Number((weight * 0.453592).toFixed(2));
    }
    return Number(weight.toFixed(2));
  }

  private convertToMetricHeight(height: number, unit: HeightUnit): number {
    if (unit === HeightUnit['ft-in']) {
      // Assuming height is passed in total inches for ft-in unit preference
      return Number((height * 2.54).toFixed(2));
    }
    return Number(height.toFixed(2));
  }
}
