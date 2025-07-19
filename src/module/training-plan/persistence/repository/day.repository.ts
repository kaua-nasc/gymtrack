import { Day } from '@src/module/training-plan/persistence/entity/day.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class DayRepository extends DefaultTypeOrmRepository<Day> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(Day, dataSource.manager);
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

  async save(day: Day) {
    const saveDay = await super.save(day);

    return saveDay;
  }

  async deleteDayById(id: string) {
    await this.delete({ id });
  }
}
