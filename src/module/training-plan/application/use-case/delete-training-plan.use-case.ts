import { Injectable } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class DeleteTrainingPlanUseCase {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async execute(id: string) {
    return await this.trainingPlanRepository.deleteTrainingPlan(id);
  }
}
