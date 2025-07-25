import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { PlanDayProgress } from '../entity/plan-day-progress.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import dayjs from 'dayjs';

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

  async getDaysProgressAtWeek(planSubscriptionId: string) {
    const startOfWeek = dayjs().startOf('week').toDate();
    const endOfWeek = dayjs(startOfWeek).add(6, 'day').endOf('day').toDate();

    const daysProgress = await super.findMany({
      where: {
        planSubscriptionId,
        createdAt: MoreThanOrEqual(startOfWeek) && LessThanOrEqual(endOfWeek),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return daysProgress ?? [];
  }
}
