import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { TrainingPlanLike } from '../entity/training-plan-like.entity';

@Injectable()
export class TrainingPlanLikeRepository extends DefaultTypeOrmRepository<TrainingPlanLike> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource
  ) {
    super(TrainingPlanLike, dataSource.manager);
  }

  async findLike(trainingPlanId: string, likedBy: string): Promise<TrainingPlanLike | null> {
    return this.find({
      where: {
        trainingPlanId,
        likedBy,
      },
    });
  }

  async likeExists(trainingPlanId: string, likedBy: string): Promise<boolean> {
    return this.existsBy({ trainingPlanId, likedBy });
  }

  async countByTrainingPlanIds(
    trainingPlanIds: string[]
  ): Promise<{ trainingPlanId: string; count: number }[]> {
    if (trainingPlanIds.length === 0) return [];

    const result = await this.repository
      .createQueryBuilder('like')
      .select('like.trainingPlanId', 'trainingPlanId')
      .addSelect('COUNT(*)', 'count')
      .where('like.trainingPlanId IN (:...trainingPlanIds)', { trainingPlanIds })
      .groupBy('like.trainingPlanId')
      .getRawMany();

    return result.map((item) => ({
      trainingPlanId: item.trainingPlanId,
      count: Number.parseInt(item.count, 10),
    }));
  }

  async findLikesByPlanIdsAndUserId(
    trainingPlanIds: string[],
    userId: string
  ): Promise<TrainingPlanLike[]> {
    if (trainingPlanIds.length === 0) return [];

    return this.repository.find({
      where: {
        trainingPlanId: In(trainingPlanIds),
        likedBy: userId,
      },
    });
  }
}
