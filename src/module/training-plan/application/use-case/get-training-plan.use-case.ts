import { Injectable } from '@nestjs/common';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class GetTrainingPlanUseCase {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async execute(id: string) {
    return await this.trainingPlanRepository.findOneById(id);
  }
}
