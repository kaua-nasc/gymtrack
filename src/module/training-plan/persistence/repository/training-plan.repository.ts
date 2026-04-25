import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TrainingPlan } from '@src/module/training-plan/persistence/entity/training-plan.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

@Injectable()
export class TrainingPlanRepository extends DefaultTypeOrmRepository<TrainingPlan> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(TrainingPlan, dataSource.manager, logger);
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

  async findOneTrainingPlanById(id: string, relations?: string[]): Promise<TrainingPlan | null> {
    return await super.findOneById(id, relations);
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    await this.delete({ id });
  }
}
