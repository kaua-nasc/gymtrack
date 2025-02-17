import { Injectable } from '@nestjs/common';
import { TrainingPlanProgressStatus } from '@src/module/training-plan/core/enum/training-plan-progress-status.enum';
import { CreateTrainingPlanProgressRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-progress-request.dto';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';

@Injectable()
export class CreateTrainingPlanProgressUseCase {
  constructor(
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository
  ) {}
  async execute(traininPlanData: CreateTrainingPlanProgressRequestDto) {
    const trainingPlanProgress = new TrainingPlanProgress({
      ...traininPlanData,
      status: TrainingPlanProgressStatus.notStarted,
    });

    return await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      trainingPlanProgress
    );
  }
}
