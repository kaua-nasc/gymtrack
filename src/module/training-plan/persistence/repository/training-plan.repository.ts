import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class TrainingPlanRepository extends DefaultTypeOrmRepository<TrainingPlan> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(TrainingPlan, transactionalEntityManager);
  }

  async traningPlanExists(trainingPlanId: string) {
    return this.existsBy({ id: trainingPlanId });
  }

  async saveTrainingPlan(entity: TrainingPlanModel) {
    return await super.save(
      new TrainingPlan({
        ...entity,
        days: [],
      })
    );
  }
}
