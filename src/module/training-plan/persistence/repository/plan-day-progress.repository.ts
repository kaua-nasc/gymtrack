import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import dayjs from 'dayjs';
import { Between, DataSource } from 'typeorm';
import { PlanDayProgressStatus } from '../../core/enum/plan-day-progress-status.enum';
import { PlanDayProgress } from '../entity/plan-day-progress.entity';
import { PlanSubscription } from '../entity/plan-subscription.entity';

export class PlanDayProgressRepository extends DefaultTypeOrmRepository<PlanDayProgress> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(PlanDayProgress, dataSource.manager, logger);
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

  async findCompletedTrainingDays(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Date[]> {
    const results = await this.manager
      .createQueryBuilder(PlanDayProgress, 'progress')
      .innerJoin(
        PlanSubscription,
        'subscription',
        'progress.planSubscriptionId = subscription.id'
      )
      .select('DISTINCT DATE(progress.createdAt)', 'date')
      .where('subscription.userId = :userId', { userId })
      .andWhere('progress.status = :status', {
        status: PlanDayProgressStatus.COMPLETED,
      })
      .andWhere('progress.createdAt >= :startDate', { startDate })
      .andWhere('progress.createdAt <= :endDate', { endDate })
      .getRawMany();

    return results.map((r) => new Date(r.date));
  }
}
