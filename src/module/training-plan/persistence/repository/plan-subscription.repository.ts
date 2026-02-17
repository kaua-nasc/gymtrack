import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, In } from 'typeorm';
import { PlanSubscription } from '../entity/plan-subscription.entity';

export class PlanSubscriptionRepository extends DefaultTypeOrmRepository<PlanSubscription> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(PlanSubscription, dataSource.manager);
  }

  async remove(entity: PlanSubscription): Promise<void> {
    return await super.delete({ id: entity.id });
  }

  async getUserSubscriptionForPlan(
    userId: string,
    planIds: string[]
  ): Promise<PlanSubscription[]> {
    return (
      (await this.findMany({
        where: {
          userId,
          trainingPlanId: In(planIds),
        },
      })) ?? []
    );
  }
}
