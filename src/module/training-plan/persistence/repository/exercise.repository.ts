import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { Exercise } from '@src/module/training-plan/persistence/entity/exercise.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class ExerciseRepository extends DefaultTypeOrmRepository<Exercise> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Exercise, transactionalEntityManager);
  }

  async saveExercise(entity: ExerciseModel) {
    const trainingPlan = new Exercise({ ...entity });

    await super.save(trainingPlan);
  }
}
