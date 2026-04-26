import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { ActiveSetLog } from '@src/module/training-plan/persistence/entity/active-set-log.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ActiveSetLogRepository extends DefaultTypeOrmRepository<ActiveSetLog> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(ActiveSetLog, dataSource.manager, logger);
  }

  async findLogsBySessionId(sessionId: string): Promise<ActiveSetLog[]> {
    return (
      (await this.findMany({
        where: { sessionId },
        order: { createdAt: 'ASC' },
      })) ?? []
    );
  }
}
