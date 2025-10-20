import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TrainingPlanFeedback } from '../entity/training-plan-feedback.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';

@Injectable()
export class TrainingPlanFeedbackRepository extends DefaultTypeOrmRepository<TrainingPlanFeedback> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(TrainingPlanFeedback, dataSource.manager);
  }
}
