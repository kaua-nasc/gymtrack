import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { WeightLog } from '../entity/weight-log.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

@Injectable()
export class WeightLogRepository extends DefaultTypeOrmRepository<WeightLog> {
  constructor(
    @InjectDataSource('identity') dataSource: DataSource,
    logger: AppLogger
  ) {
    super(WeightLog, dataSource.createEntityManager(), logger);
  }
}
