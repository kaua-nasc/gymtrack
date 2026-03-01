import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { PlanInvite } from '@src/module/training-plan/persistence/entity/plan-invite.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PlanInviteRepository extends DefaultTypeOrmRepository<PlanInvite> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(PlanInvite, dataSource.manager, logger);
  }
}
