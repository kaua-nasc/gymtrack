import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class GetTrainingPlanUseCase {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}

  async execute(id: string) {
    const trainingPlan = await this.trainingPlanRepository.findOneById(id);

    if (!trainingPlan) throw new NotFoundException();

    const progress = await this.trainingPlanProgressRepository.findTrainingPlanProgress(
      trainingPlan.authorId,
      trainingPlan.id
    );

    return { ...trainingPlan, status: progress.status };
  }
}
