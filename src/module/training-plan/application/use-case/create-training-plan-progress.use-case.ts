import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { TrainingPlanProgressModel } from '@src/module/training-plan/core/model/training-plan-progress.model';
import { CreateTrainingPlanProgressData } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

@Injectable()
export class CreateTrainingPlanProgressUseCase {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}
  async execute(traininPlanData: CreateTrainingPlanProgressData) {
    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      TrainingPlanProgressModel.create({
        ...traininPlanData,
        status: TrainingPlanProgressStatus.notStarted,
      })
    );
  }
}
