import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { TrainingPlanComment } from '../entity/training-plan-comment.entity';

export class TrainingPlanCommentRepository extends DefaultTypeOrmRepository<TrainingPlanComment> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(TrainingPlanComment, dataSource.manager);
  }
}
