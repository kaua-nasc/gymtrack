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

  async saveTrainingPlan(entity: TrainingPlanModel): Promise<TrainingPlanModel> {
    const createdTrainingPlan = await super.save(
      new TrainingPlan({
        ...entity,
      })
    );
    return TrainingPlanModel.create({ ...createdTrainingPlan });
  }

  async findTrainingPlansByAuthorId(authorId: string): Promise<TrainingPlanModel[]> {
    const trainingPlans = await this.findMany({ where: { authorId } });

    if (!trainingPlans) return [];

    return trainingPlans?.map((t) => TrainingPlanModel.create({ ...t }));
  }

  async findOneTrainingPlanById(
    id: string,
    relations?: string[]
  ): Promise<TrainingPlanModel> {
    const trainingPlan = await super.findOneById(id, relations);

    if (!trainingPlan) {
      throw new Error();
    }

    return TrainingPlanModel.create({ ...trainingPlan });
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    const trainingPlan = await this.findOneTrainingPlanById(id);

    await this.delete({ id: trainingPlan.id });
  }
}
