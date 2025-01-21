import { TrainingModel } from '@src/module/training-plan/core/model/training.model';
import { Training } from '@src/module/training-plan/persistence/entity/training.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class TrainingRepository extends DefaultTypeOrmRepository<Training> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Training, transactionalEntityManager);
  }

  async saveTraining(entity: TrainingModel) {
    const trainingPlan = new Training({ ...entity, exercises: [] });

    await super.save(trainingPlan);
  }
}
