import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from '@src/module/training-plan/persistence/repository/exercise.repository';

@Injectable()
export class DeleteExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}
  async execute(id: string) {
    return await this.exerciseRepository.deleteExerciseById(id);
  }
}
