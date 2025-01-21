import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { Day } from '@src/module/training-plan/persistence/entity/day.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class DayRepository extends DefaultTypeOrmRepository<Day> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Day, transactionalEntityManager);
  }

  async saveDay(entity: DayModel) {
    const day = new Day({
      ...entity,
      trainingPlanId: entity.trainingPlanId,
      trainings: [],
    });
    return await super.save(day);
  }
}
