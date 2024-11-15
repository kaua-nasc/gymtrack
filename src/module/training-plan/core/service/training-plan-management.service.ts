import { Injectable } from '@nestjs/common';
import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';

@Injectable()
export class TrainingPlanManagementService {
  constructor(private readonly trainingPlanRepository: TrainingPlanRepository) {}

  async createTrainingPlan(trainingPlan: {
    name: string;
    days: DayModel[];
    userId: string;
    timeInDays: number;
    type: TrainingType;
    observation: string | null;
    pathology: string | null;
    level: TrainingLevel;
  }) {
    const newTrainingPlan = TrainingPlanModel.create({
      ...trainingPlan,
    });

    this.trainingPlanRepository.save(newTrainingPlan);

    return newTrainingPlan;
  }

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }
}
