import { Injectable } from '@nestjs/common';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';

@Injectable()
export class ExerciseManagementService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}
  async createExercise(training: Input) {
    const newTraining = ExerciseModel.create({ ...training });

    await this.exerciseRepository.saveExercise({ ...newTraining });

    return newTraining;
  }

  async getExercises(trainingId: string) {
    return await this.exerciseRepository.findMany({ where: { trainingId } });
  }

  async getExerciseById(id: string) {
    return await this.exerciseRepository.findOneById(id);
  }

  async deleteOne(id: string) {
    return await this.exerciseRepository.delete({ id });
  }
}

type Input = {
  name: string;
  type: ExerciseType;
  setsNumber: number;
  repsNumber: number;
  description: string;
  observation: string;
  trainingId: string;
};
