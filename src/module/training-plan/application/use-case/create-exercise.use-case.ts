import { Injectable } from '@nestjs/common';
import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { CreateExerciseRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-exercise-request.dto';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';

@Injectable()
export class CreateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(execiseData: CreateExerciseRequestDto) {
    return await this.exerciseRepository.saveExercise(
      ExerciseModel.create({
        ...execiseData,
      })
    );
  }
}
