import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { PlanDayProgress } from '../entity/plan-day-progress.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource } from 'typeorm';
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
    const startOfWeek = dayjs().startOf('week').toDate(); // Domingo 00:00
    const endOfWeek = dayjs().startOf('week').add(6, 'day').endOf('day').toDate();

    const daysProgress = await super.findMany({
      where: {
        planSubscriptionId,
        createdAt: Between(startOfWeek, endOfWeek),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const result: (PlanDayProgress | null)[] = new Array(7).fill(null);

    if (daysProgress == null) return result;

    for (const progress of daysProgress) {
      const weekDay = dayjs(progress.createdAt).day();
      if (weekDay <= dayjs().day()) {
        result[weekDay] = progress;
      }
    }

    return result;
  }
}
