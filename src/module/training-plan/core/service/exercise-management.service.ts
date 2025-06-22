import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';
import { CreateExerciseRequestDto } from '../../http/rest/dto/request/create-exercise-request.dto';
import { Exercise } from '../../persistence/entity/exercise.entity';

@Injectable()
export class ExerciseManagementService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}
  async create(execiseData: CreateExerciseRequestDto) {
    return await this.exerciseRepository.saveExercise(new Exercise({ ...execiseData }));
  }

  async delete(id: string) {
    return await this.exerciseRepository.deleteExerciseById(id);
  }

  async get(id: string) {
    return await this.exerciseRepository.findExeciseById(id);
  }

  async execute(dayId: string) {
    return await this.exerciseRepository.findExecisesByDayId(dayId);
  }
}
