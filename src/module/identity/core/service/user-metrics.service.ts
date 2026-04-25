import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DataSource, EntityManager } from 'typeorm';
import { HeightUnit } from '../../core/enum/height-unit.enum';
import { MeasurementType } from '@src/module/identity/core/enum/measurement-type.enum';
import { MetricGoalStatus } from '../../core/enum/metric-goal-status.enum';
import { UserType } from '../../core/enum/user-type.enum';
import { WeightUnit } from '../../core/enum/weight-unit.enum';
import { AddBodyMeasurementsRequestDto } from '../../http/rest/dto/request/add-body-measurements-request.dto';
import { AddWeightLogRequestDto } from '../../http/rest/dto/request/add-weight-log-request.dto';
import { CreateMetricGoalRequestDto } from '../../http/rest/dto/request/create-metric-goal-request.dto';
import { UpdateMetricGoalStatusRequestDto } from '../../http/rest/dto/request/update-metric-goal-status-request.dto';
import { UpdateUserMetricsRequestDto } from '../../http/rest/dto/request/update-user-metrics-request.dto';
import { BodyMeasurement } from '../../persistence/entity/body-measurement.entity';
import { MetricGoal } from '../../persistence/entity/metric-goal.entity';
import { User } from '../../persistence/entity/user.entity';
import { WeightLog } from '../../persistence/entity/weight-log.entity';
import { BodyMeasurementRepository } from '../../persistence/repository/body-measurement.repository';
import { MetricGoalRepository } from '../../persistence/repository/metric-goal.repository';
import { TrainerStudentRelationshipRepository } from '../../persistence/repository/trainer-student-relationship.repository';
import { UserRepository } from '../../persistence/repository/user.repository';
import { UserPrivacySettingsRepository } from '../../persistence/repository/user-privacy-settings.repository';
import { WeightLogRepository } from '../../persistence/repository/weight-log.repository';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { MetricGoalNotFoundException } from '../exception/metric-goal-not-found.exception';
import { WeightLogNotFoundException } from '../exception/weight-log-not-found.exception';
import { BodyMeasurementNotFoundException } from '../exception/body-measurement-not-found.exception';
import { DomainException } from '@src/module/shared/core/exception/domain.exception';

@Injectable()
export class UserMetricsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly weightLogRepository: WeightLogRepository,
    private readonly bodyMeasurementRepository: BodyMeasurementRepository,
    private readonly metricGoalRepository: MetricGoalRepository,
    private readonly userPrivacySettingsRepository: UserPrivacySettingsRepository,
    private readonly trainerStudentRelationshipRepository: TrainerStudentRelationshipRepository,
    @InjectDataSource('identity') private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
    @Inject(REQUEST) private readonly request: { user: { id: string; type: UserType } }
  ) {}

  async updateMetrics(dto: UpdateUserMetricsRequestDto): Promise<void> {
    const userId = this.request.user.id;
    this.logger.log(`Updating metrics for user: ${userId}`);

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
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
      throw new UserNotFoundException(userId);
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
      throw new UserNotFoundException(userId);
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
    if (!user) throw new UserNotFoundException(userId);

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
      throw new MetricGoalNotFoundException(id);
    }

    await this.metricGoalRepository.update({ id }, { status: dto.status });
  }

  async getStudentWeightHistory(
    studentId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: WeightLog[]; total: number }> {
    const { minDate } = await this.validateTrainerAccess(studentId);

    const [items, total] = await this.weightLogRepository.findAndCountByUserId(
      studentId,
      page,
      limit,
      minDate
    );

    return { items, total };
  }

  async getStudentBodyMeasurementsHistory(
    studentId: string,
    type?: MeasurementType,
    page = 1,
    limit = 20
  ): Promise<{ items: BodyMeasurement[]; total: number }> {
    const { minDate } = await this.validateTrainerAccess(studentId);

    const [items, total] = await this.bodyMeasurementRepository.findAndCountByUserId(
      studentId,
      type,
      page,
      limit,
      minDate
    );

    return { items, total };
  }

  async getStudentLatestBodyMeasurements(studentId: string): Promise<BodyMeasurement[]> {
    const { minDate } = await this.validateTrainerAccess(studentId);

    return await this.bodyMeasurementRepository.findLatestByUserId(studentId, minDate);
  }

  async getStudentMetricGoals(
    studentId: string
  ): Promise<(MetricGoal & { progress: number })[]> {
    const { minDate } = await this.validateTrainerAccess(studentId);

    const goals = await this.metricGoalRepository.findAllByUserId(studentId, minDate);
    const user = await this.userRepository.findOneById(studentId);

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let currentValue: number;
        if (goal.type === 'WEIGHT') {
          currentValue = user?.currentWeight || goal.startingValue;
        } else {
          const latest = await this.bodyMeasurementRepository.findAndCountByUserId(
            studentId,
            goal.type as MeasurementType,
            1,
            1,
            minDate
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

  async addWeightLogNote(logId: string, note: string): Promise<void> {
    this.logger.log(`Trainer adding note to weight log: ${logId}`);
    const log = await this.weightLogRepository.findOneById(logId);
    if (!log) {
      throw new WeightLogNotFoundException(logId);
    }

    await this.validateTrainerAccess(log.userId);

    await this.weightLogRepository.update(
      { id: logId },
      {
        trainerNote: note,
        trainerNoteAt: new Date(),
      }
    );
  }

  async addBodyMeasurementNote(measurementId: string, note: string): Promise<void> {
    this.logger.log(`Trainer adding note to body measurement: ${measurementId}`);
    const measurement = await this.bodyMeasurementRepository.findOneById(measurementId);
    if (!measurement) {
      throw new BodyMeasurementNotFoundException(measurementId);
    }

    await this.validateTrainerAccess(measurement.userId);

    await this.bodyMeasurementRepository.update(
      { id: measurementId },
      {
        trainerNote: note,
        trainerNoteAt: new Date(),
      }
    );
  }

  private async validateTrainerAccess(studentId: string): Promise<{ minDate?: Date }> {
    const { id: trainerId, type } = this.request.user;

    if (type !== UserType.personalTrainer) {
      throw new DomainException('only personal trainers can access student metrics');
    }

    const relationship = await this.trainerStudentRelationshipRepository.find({
      where: { trainerId, studentId },
    });

    if (!relationship) {
      this.logger.warn(
        `Trainer ${trainerId} attempted to access unauthorized student ${studentId}`
      );
      throw new DomainException('this user is not your student');
    }

    const privacy = await this.userPrivacySettingsRepository.findOneByUserId(studentId);

    if (!privacy?.sharePastDataWithTrainer) {
      return { minDate: relationship.linkedAt };
    }

    return {};
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
