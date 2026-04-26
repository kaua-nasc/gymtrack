import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource, In } from 'typeorm';
import { PlanDayProgressStatus } from '../../core/enum/plan-day-progress-status.enum';
import { PlanDayProgress } from '../entity/plan-day-progress.entity';
import { PlanSubscription } from '../entity/plan-subscription.entity';

export class PlanSubscriptionRepository extends DefaultTypeOrmRepository<PlanSubscription> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(PlanSubscription, dataSource.manager, logger);
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

  async logDayProgress(planSubscriptionId: string, dayId: string): Promise<void> {
    const progress = new PlanDayProgress({
      planSubscriptionId,
      dayId,
      status: PlanDayProgressStatus.COMPLETED,
    });

    await this.manager.save(PlanDayProgress, progress);
  }
}
