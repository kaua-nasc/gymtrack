import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { TrainingPlanLike } from '../entity/training-plan-like.entity';

@Injectable()
export class TrainingPlanLikeRepository extends DefaultTypeOrmRepository<TrainingPlanLike> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(TrainingPlanLike, dataSource.manager);
  }
}
