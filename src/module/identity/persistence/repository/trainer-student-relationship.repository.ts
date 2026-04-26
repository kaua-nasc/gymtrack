import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { DataSource } from 'typeorm';
import { TrainerStudentRelationship } from '../entity/trainer-student-relationship.entity';

@Injectable()
export class TrainerStudentRelationshipRepository extends DefaultTypeOrmRepository<TrainerStudentRelationship> {
  constructor(
    @InjectDataSource('identity')
    dataSource: DataSource,
    logger: AppLogger
  ) {
    super(TrainerStudentRelationship, dataSource.manager, logger);
  }

  async findByStudentId(studentId: string): Promise<TrainerStudentRelationship | null> {
    return this.find({
      where: { studentId },
    });
  }

  async findByTrainerId(trainerId: string): Promise<TrainerStudentRelationship[]> {
    return (
      (await this.findMany({
        where: { trainerId },
        relations: ['student'],
      })) ?? []
    );
  }

  async deleteRelationship(trainerId: string, studentId: string): Promise<void> {
    await this.repository.delete({ trainerId, studentId });
  }
}
