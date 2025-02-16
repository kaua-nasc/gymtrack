import { Injectable } from '@nestjs/common';
import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

export interface CreateTrainingPlanData {
  name: string;
  authorId: string;
  lastUpdatedBy?: string;
  timeInDays: number;
  type: TrainingPlanType;
  observation?: string;
  pathology?: string;
  level: TrainingPlanLevel;
  visibility: TrainingPlanVisibility;
}

@Injectable()
export class TrainingPlanManagementService {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async createTrainingPlan(trainingPlan: {
    name: string;
    authorId: string;
    lastUpdatedBy?: string;
    timeInDays: number;
    type: TrainingPlanType;
    visibility: TrainingPlanVisibility;
    observation?: string;
    pathology?: string;
    level: TrainingPlanLevel;
  }) {
    return await this.trainingPlanRepository.saveTrainingPlan(
      TrainingPlanModel.create({
        ...trainingPlan,
      })
    );
  }

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async findTrainingPlansByAuthorId(authorId: string) {
    return await this.trainingPlanRepository.findTrainingPlansByAuthorId(authorId);
  }

  async findOneTrainingPlanById(id: string) {
    return await this.trainingPlanRepository.findOneTrainingPlanById(id);
  }

  async deleteTrainingPlan(id: string) {
    await this.trainingPlanRepository.deleteTrainingPlan(id);
  }
}
