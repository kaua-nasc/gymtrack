import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { ActiveWorkoutSession } from '@src/module/training-plan/persistence/entity/active-workout-session.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ActiveWorkoutSessionRepository extends DefaultTypeOrmRepository<ActiveWorkoutSession> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(ActiveWorkoutSession, dataSource.manager, logger);
  }

  async findActiveSessionByUserId(
    userId: string,
    loadProgress = false
  ): Promise<ActiveWorkoutSession | null> {
    const relations = ['logs'];
    if (loadProgress) {
      relations.push('planDayProgress');
    }
    return this.find({
      where: { userId },
      relations,
    });
  }
}
