import { Injectable } from '@nestjs/common';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { CreateTrainingPlanRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-training-plan-request.dto';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class CreateTrainingPlanUseCase {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async execute(trainingPlanData: CreateTrainingPlanRequestDto) {
    return await this.trainingPlanRepository.saveTrainingPlan(
      TrainingPlanModel.create({
        ...trainingPlanData,
      })
    );
  }
}
