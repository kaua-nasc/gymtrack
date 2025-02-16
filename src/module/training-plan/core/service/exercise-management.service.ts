import { Injectable } from '@nestjs/common';
import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';

@Injectable()
export class ExerciseManagementService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}
  async createExercise(exercise: {
    dayId: string;
    name: string;
    type: ExerciseType;
    setsNumber: number;
    repsNumber: number;
    description?: string;
    observation?: string;
  }) {
    const newExercise = ExerciseModel.create({ ...exercise });

    await this.exerciseRepository.saveExercise({ ...newExercise });

    return newExercise;
  }

  async findExecisesByDayId(dayId: string) {
    return await this.exerciseRepository.findExecisesByDayId(dayId);
  }

  async findExeciseById(id: string) {
    return await this.exerciseRepository.findExeciseById(id);
  }

  async deleteExerciseById(id: string) {
    return await this.exerciseRepository.deleteExerciseById(id);
  }
}
