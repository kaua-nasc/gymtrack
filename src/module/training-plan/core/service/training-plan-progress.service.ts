import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

export interface CreateTrainingPlanProgressData {
  userId: string;
  trainingPlanId: string;
}

@Injectable()
export class TrainingPlanProgressService {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}
}
