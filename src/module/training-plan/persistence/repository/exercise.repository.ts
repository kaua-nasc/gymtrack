import { Exercise } from '@src/module/training-plan/persistence/entity/exercise.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class ExerciseRepository extends DefaultTypeOrmRepository<Exercise> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Exercise, transactionalEntityManager);
  }

  async saveExercise(entity: Exercise): Promise<Exercise> {
    const exercise = new Exercise({ ...entity });

    return await super.save(exercise);
  }

  async findExeciseById(id: string): Promise<Exercise> {
    const exercise = await this.find({ where: { id } });

    if (!exercise) throw new Error();

    return exercise;
  }

  async findExecisesByDayId(dayId: string): Promise<Exercise[]> {
    const exercises = await this.findMany({ where: { dayId } });

    if (!exercises) throw new Error();

    return exercises;
  }

  async deleteExerciseById(id: string) {
    await this.delete({ id });
  }
}
