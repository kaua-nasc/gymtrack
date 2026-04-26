import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Day } from '@src/module/training-plan/persistence/entity/day.entity';
import { DataSource } from 'typeorm';

export class DayRepository extends DefaultTypeOrmRepository<Day> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(Day, dataSource.manager, logger);
  }

  async findDaysByTrainingPlanId(
    trainingPlanId: string,
    recursivaly: boolean = false
  ): Promise<Day[]> {
    const days =
      (await this.findMany({
        where: { trainingPlanId },
        relations: recursivaly ? ['exercises'] : undefined,
      })) ?? [];

    return days;
  }

  async findDayById(id: string, recursivaly: boolean = false): Promise<Day | null> {
    const day = await this.find({
      where: { id },
      relations: recursivaly ? ['exercises'] : undefined,
    });

    return day;
  }

  async deleteDayById(id: string) {
    await this.delete({ id });
  }
}
