import { Day } from '@src/module/training-plan/persistence/entity/day.entity';
import { Exercise } from '@src/module/training-plan/persistence/entity/exercise.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class DayRepository extends DefaultTypeOrmRepository<Day> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Day, transactionalEntityManager);
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

  async findDayById(id: string, recursivaly: boolean = false): Promise<Day> {
    const day = await this.find({
      where: { id },
      relations: recursivaly ? ['exercises'] : undefined,
    });

    if (!day) throw new Error();

    return day;
  }

  async saveDay(day: Day) {
    const saveDay = await super.save(
      new Day({ ...day, exercises: day.exercises.map((e) => new Exercise({ ...e })) })
    );

    return saveDay;
  }

  async deleteDayById(id: string) {
    await this.delete({ id });
  }
}
