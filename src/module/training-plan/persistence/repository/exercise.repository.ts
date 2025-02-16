import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { Exercise } from '@src/module/training-plan/persistence/entity/exercise.entity';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

export class ExerciseRepository extends DefaultTypeOrmRepository<Exercise> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Exercise, transactionalEntityManager);
  }

  async saveExercise(entity: ExerciseModel): Promise<ExerciseModel> {
    const exercise = new Exercise({ ...entity });

    const createdExercise = await super.save(exercise);

    return ExerciseModel.create({ ...createdExercise });
  }

  async findExeciseById(id: string): Promise<ExerciseModel> {
    const exercise = await this.find({ where: { id } });

    if (!exercise) throw new Error();

    return ExerciseModel.create({ ...exercise });
  }

  async findExecisesByDayId(dayId: string): Promise<ExerciseModel[]> {
    const exercises = await this.findMany({ where: { dayId } });

    if (!exercises) throw new Error();

    return exercises?.map((exercise) => ExerciseModel.create({ ...exercise }));
  }

  async deleteExerciseById(id: string) {
    await this.delete({ id });
  }
}
