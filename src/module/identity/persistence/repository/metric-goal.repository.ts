import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { MetricGoalStatus } from '../../core/enum/metric-goal-status.enum';
import { MetricGoal } from '../entity/metric-goal.entity';

@Injectable()
export class MetricGoalRepository extends DefaultTypeOrmRepository<MetricGoal> {
  constructor(@InjectDataSource('identity') dataSource: DataSource, logger: AppLogger) {
    super(MetricGoal, dataSource.createEntityManager(), logger);
  }

  async findAllByUserId(userId: string, minDate?: Date): Promise<MetricGoal[]> {
    const where: FindOptionsWhere<MetricGoal> = { userId };

    if (minDate) {
      where.createdAt = MoreThanOrEqual(minDate);
    }

    return (
      (await this.findMany({
        where,
        order: { createdAt: 'DESC' },
      })) ?? []
    );
  }

  async findActiveByUserIdAndType(userId: string, type: string): Promise<MetricGoal[]> {
    const where: FindOptionsWhere<MetricGoal> = {
      userId,
      type,
      status: MetricGoalStatus.ACTIVE,
    };
    return (await this.findMany({ where })) ?? [];
  }
}
