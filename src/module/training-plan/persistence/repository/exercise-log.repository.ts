import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { ExerciseLog } from '../entity/exercise-log.entity';

@Injectable()
export class ExerciseLogRepository extends DefaultTypeOrmRepository<ExerciseLog> {
  constructor(
    @InjectDataSource('training-plan')
    dataSource: DataSource,
  ) {
    super(ExerciseLog, dataSource.manager);
  }

  async findLogsByExerciseAndUser(
    exerciseId: string,
    userId: string
  ): Promise<ExerciseLog[]> {
    return this.findMany({
      where: { exerciseId, userId },
      order: { createdAt: 'DESC' },
    });
  }
}
