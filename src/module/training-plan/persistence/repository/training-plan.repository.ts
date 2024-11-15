import { Inject } from '@nestjs/common';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';

export class TrainingPlanRepository extends DefaultTypeOrmRepository<TrainingPlanModel> {
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(TrainingPlanModel, dataSource);
  }

  async traningPlanExists(trainingPlanId: string) {
    return this.existsBy({ id: trainingPlanId });
  }
}
