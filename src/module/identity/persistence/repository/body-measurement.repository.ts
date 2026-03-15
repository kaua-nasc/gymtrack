import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, FindOptionsOrder, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { MeasurementType } from '../../core/enum/measurement-type.enum';
import { BodyMeasurement } from '../entity/body-measurement.entity';

@Injectable()
export class BodyMeasurementRepository extends DefaultTypeOrmRepository<BodyMeasurement> {
  constructor(@InjectDataSource('identity') dataSource: DataSource, logger: AppLogger) {
    super(BodyMeasurement, dataSource.createEntityManager(), logger);
  }

  async findAndCountByUserId(
    userId: string,
    type?: MeasurementType,
    page = 1,
    limit = 20,
    minDate?: Date
  ): Promise<[BodyMeasurement[], number]> {
    const where: FindOptionsWhere<BodyMeasurement> = {
      userId,
      ...(type && { type }),
    };

    if (minDate) {
      where.measuredAt = MoreThanOrEqual(minDate);
    }

    const order: FindOptionsOrder<BodyMeasurement> = {
      measuredAt: 'DESC',
    };

    return this.repository.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findLatestByUserId(userId: string, minDate?: Date): Promise<BodyMeasurement[]> {
    const qb = this.repository.createQueryBuilder('bm');
    qb.where('bm.userId = :userId', { userId });

    if (minDate) {
      qb.andWhere('bm.measuredAt >= :minDate', { minDate });
    }

    return qb
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub_bm.measuredAt)')
          .from(BodyMeasurement, 'sub_bm')
          .where('sub_bm.userId = :userId', { userId })
          .andWhere('sub_bm.type = bm.type');

        if (minDate) {
          subQuery.andWhere('sub_bm.measuredAt >= :minDate', { minDate });
        }

        return `bm.measuredAt = ${subQuery.getQuery()}`;
      })
      .getMany();
  }
}
