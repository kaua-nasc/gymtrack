import { DataSource } from 'typeorm';
import { PlanSubscription } from '../entity/plan-subscription.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { InjectDataSource } from '@nestjs/typeorm';

export class PlanSubscriptionRepository extends DefaultTypeOrmRepository<PlanSubscription> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(PlanSubscription, dataSource.manager);
  }

  async save(entity: PlanSubscription): Promise<PlanSubscription> {
    return await super.save(entity);
  }

  async remove(entity: PlanSubscription): Promise<void> {
    return await super.delete({ id: entity.id });
  }
}
