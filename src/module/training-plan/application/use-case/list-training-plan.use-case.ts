import { Injectable } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class ListTrainingPlanUseCase {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async execute(userId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(userId);
  }
}
