import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { TrainingPlanComment } from '../entity/training-plan-comment.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

export class TrainingPlanCommentRepository extends DefaultTypeOrmRepository<TrainingPlanComment> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(TrainingPlanComment, dataSource.manager, logger);
  }
}
