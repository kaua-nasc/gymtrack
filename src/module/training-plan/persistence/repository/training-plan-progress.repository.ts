import { NotFoundException } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

interface UpdateTrainingPlan {
  userId: string;
  trainingPlanId: string;
  newStatus: TrainingPlanProgressStatus;
}

export class TrainingPlanProgressRepository extends DefaultTypeOrmRepository<TrainingPlanProgress> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(TrainingPlanProgress, transactionalEntityManager);
  }

  async saveTrainingPlanProgress(
    entity: TrainingPlanProgress
  ): Promise<TrainingPlanProgress> {
    return await this.repository.save(entity);
  }

  async updateTrainingPlanProgressStatus({
    userId,
    trainingPlanId,
    newStatus,
  }: UpdateTrainingPlan) {
    await this.repository.update(
      { userId, trainingPlanId },
      { status: newStatus, updatedAt: new Date() }
    );
  }

  async findTrainingPlanProgress(userId: string, trainingPlanId: string) {
    const data = await this.repository.findOneBy({ userId, trainingPlanId });

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }
}
