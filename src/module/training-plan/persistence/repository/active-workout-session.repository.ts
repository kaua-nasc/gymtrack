import { ActiveWorkoutSession } from '@src/module/training-plan/persistence/entity/active-workout-session.entity';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ActiveWorkoutSessionRepository extends DefaultTypeOrmRepository<ActiveWorkoutSession> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(ActiveWorkoutSession, dataSource.manager, logger);
  }

  async findActiveSessionByUserId(userId: string): Promise<ActiveWorkoutSession | null> {
    return this.find({
      where: { userId },
      relations: ['logs'],
    });
  }
}
