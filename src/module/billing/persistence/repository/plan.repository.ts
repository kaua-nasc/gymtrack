import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Plan } from '../entity/plan.entity';
import { PlanModel } from '../../core/model/plan.model';

@Injectable()
export class PlanRepository extends DefaultTypeOrmRepository<Plan> {
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(Plan, dataSource);
  }

  async createPlan(entityLike: PlanModel) {
    const plan = this.create({ ...entityLike });

    await this.save(plan);

    return plan;
  }
}
