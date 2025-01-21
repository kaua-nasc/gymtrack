import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Plan } from '@src/module/billing/persistence/entity/plan.entity';
import { PlanModel } from '@src/module/billing/core/model/plan.model';

@Injectable()
export class PlanRepository extends DefaultTypeOrmRepository<Plan> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Plan, transactionalEntityManager);
  }

  async createPlan(entityLike: PlanModel) {
    const plan = new Plan({ ...entityLike });

    await this.save(plan);

    return plan;
  }

  async findOneBy(id: string) {
    return await this.findOneById(id);
  }
}
