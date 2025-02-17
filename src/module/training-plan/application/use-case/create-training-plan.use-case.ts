import { Injectable } from '@nestjs/common';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingPlanProgressService } from '@src/module/training-plan/core/service/training-plan-progress.service';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlanProgress } from '@src/module/training-plan/persistence/entity/training-plan-progress.entity';
import { TrainingPlanProgressRepository } from '@src/module/training-plan/persistence/repository/training-plan-progress.repository';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class CreateTrainingPlanUseCase {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly trainingPlanProgressRepository: TrainingPlanProgressRepository,
    private readonly trainingPlanProgressService: TrainingPlanProgressService
  ) {}

  async execute(trainingPlanData: CreateTrainingPlanRequestDto) {
    const trainingPlan = await this.trainingPlanRepository.saveTrainingPlan(
      TrainingPlanModel.create({
        ...trainingPlanData,
      })
    );

    const trainingPlanProgress = new TrainingPlanProgress({
      userId: trainingPlan.authorId,
      trainingPlanId: trainingPlan.id,
    });

    this.trainingPlanProgressService.setStatusToNotStarted(trainingPlanProgress);

    await this.trainingPlanProgressRepository.saveTrainingPlanProgress(
      trainingPlanProgress
    );

    return { id: trainingPlan.id };
  }
}
