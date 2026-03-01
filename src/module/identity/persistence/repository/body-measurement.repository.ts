import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { BodyMeasurement } from '../entity/body-measurement.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { MeasurementType } from '../../core/enum/measurement-type.enum';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

@Injectable()
export class BodyMeasurementRepository extends DefaultTypeOrmRepository<BodyMeasurement> {
  constructor(
    @InjectDataSource('identity') dataSource: DataSource,
    logger: AppLogger
  ) {
    super(BodyMeasurement, dataSource.createEntityManager(), logger);
  }

  async findAndCountByUserId(userId: string, type?: MeasurementType, page = 1, limit = 20): Promise<[BodyMeasurement[], number]> {
    const where: FindOptionsWhere<BodyMeasurement> = {
      userId,
      ...(type && { type }),
    };

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

  async findLatestByUserId(userId: string): Promise<BodyMeasurement[]> {
    return this.repository
      .createQueryBuilder('bm')
      .where('bm.userId = :userId', { userId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(sub_bm.measuredAt)')
          .from(BodyMeasurement, 'sub_bm')
          .where('sub_bm.userId = :userId', { userId })
          .andWhere('sub_bm.type = bm.type')
          .getQuery();
        return `bm.measuredAt = ${subQuery}`;
      })
      .getMany();
  }
}
