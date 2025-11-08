import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class TrainingPlanRepository extends DefaultTypeOrmRepository<TrainingPlan> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(TrainingPlan, dataSource.manager);
  }

  async traningPlanExists(trainingPlanId: string) {
    return this.existsBy({ id: trainingPlanId });
  }

  async findTrainingPlansByAuthorId(authorId: string): Promise<TrainingPlan[]> {
    const trainingPlans = await this.findMany({ where: { authorId } });

    if (!trainingPlans) return [];

    return trainingPlans;
  }

  async findTrainingPlans(): Promise<TrainingPlan[]> {
    const trainingPlans = await this.findMany({});

    if (!trainingPlans) return [];

    return trainingPlans;
  }

  async findOneTrainingPlanById(id: string, relations?: string[]): Promise<TrainingPlan> {
    const trainingPlan = await super.findOneById(id, relations);

    if (!trainingPlan) {
      throw new Error();
    }

    return trainingPlan;
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    const trainingPlan = await this.findOneTrainingPlanById(id);

    await this.delete({ id: trainingPlan.id });
  }
}
