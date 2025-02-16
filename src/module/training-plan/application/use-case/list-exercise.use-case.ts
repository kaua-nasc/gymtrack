import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';

@Injectable()
export class ListExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(dayId: string) {
    return await this.exerciseRepository.findExecisesByDayId(dayId);
  }
}
