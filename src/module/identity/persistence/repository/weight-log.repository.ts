import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, FindOptionsOrder, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { WeightLog } from '../entity/weight-log.entity';

@Injectable()
export class WeightLogRepository extends DefaultTypeOrmRepository<WeightLog> {
  constructor(@InjectDataSource('identity') dataSource: DataSource, logger: AppLogger) {
    super(WeightLog, dataSource.createEntityManager(), logger);
  }

  async findAndCountByUserId(
    userId: string,
    page: number,
    limit: number,
    minDate?: Date
  ): Promise<[WeightLog[], number]> {
    const where: FindOptionsWhere<WeightLog> = { userId };
    const order: FindOptionsOrder<WeightLog> = { measuredAt: 'DESC' };

    if (minDate) {
      where.measuredAt = MoreThanOrEqual(minDate);
    }

    return this.repository.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });
  }
}
