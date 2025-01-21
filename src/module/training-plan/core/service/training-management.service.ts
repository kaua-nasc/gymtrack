import { Injectable } from '@nestjs/common';
import { TrainingModel } from '@src/module/training-plan/core/model/training.model';
import { TrainingRepository } from '@src/module/training-plan/persistence/repository/training.repository';

@Injectable()
export class TrainingManagementService {
  constructor(private readonly trainingRepository: TrainingRepository) {}
  async createTraining(training: { name: string; dayId: string }) {
    const newTraining = TrainingModel.create({ exercises: [], ...training });

    await this.trainingRepository.saveTraining(newTraining);

    return newTraining;
  }

  async getTrainings(dayId: string) {
    return await this.trainingRepository.findMany({ where: { dayId } });
  }

  async getTrainingById(id: string) {
    return await this.trainingRepository.findOneById(id);
  }

  async deleteOne(id: string) {
    return await this.trainingRepository.delete({ id });
  }
}
