import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { MetricGoalStatus } from '../../core/enum/metric-goal-status.enum';
import { MetricGoal } from '../entity/metric-goal.entity';

@Injectable()
export class MetricGoalRepository extends DefaultTypeOrmRepository<MetricGoal> {
  constructor(@InjectDataSource('identity') dataSource: DataSource, logger: AppLogger) {
    super(MetricGoal, dataSource.createEntityManager(), logger);
  }

  async findAllByUserId(userId: string): Promise<MetricGoal[]> {
    return (
      (await this.findMany({
        where: { userId },
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
