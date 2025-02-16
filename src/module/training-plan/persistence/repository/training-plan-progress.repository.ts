import { NotFoundException } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgressModel } from '@src/module/training-plan/core/model/training-plan-progress.model';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';
import { EntityManager, Repository } from 'typeorm';

interface UpdateTrainingPlan {
  userId: string;
  trainingPlanId: string;
  newStatus: TrainingPlanProgressStatus;
}

export class TrainingPlanProgressRepository {
  protected repository: Repository<TrainingPlanProgress>;

  constructor(readonly transactionalEntityManager: EntityManager) {
    this.repository = transactionalEntityManager.getRepository(TrainingPlanProgress);
  }

  async saveTrainingPlanProgress(
    entity: TrainingPlanProgressModel
  ): Promise<TrainingPlanProgressModel> {
    const createdTrainingPlan = await this.repository.save(
      new TrainingPlanProgress({
        ...entity,
      })
    );
    return TrainingPlanProgressModel.create({
      ...createdTrainingPlan,
      trainingPlanId: createdTrainingPlan.trainingPlanId,
    });
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

    return TrainingPlanProgressModel.create({ ...data });
  }
}
