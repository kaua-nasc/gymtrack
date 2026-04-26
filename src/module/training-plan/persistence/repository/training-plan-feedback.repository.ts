import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { TrainingPlanFeedback } from '../entity/training-plan-feedback.entity';

@Injectable()
export class TrainingPlanFeedbackRepository extends DefaultTypeOrmRepository<TrainingPlanFeedback> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(TrainingPlanFeedback, dataSource.manager, logger);
  }
}
