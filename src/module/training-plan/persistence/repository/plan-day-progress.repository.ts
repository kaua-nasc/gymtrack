import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { PlanDayProgress } from '../entity/plan-day-progress.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class PlanDayProgressRepository extends DefaultTypeOrmRepository<PlanDayProgress> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(PlanDayProgress, dataSource.manager);
  }

  async create(planDayProgress: PlanDayProgress) {
    return super.save(planDayProgress);
  }
}
