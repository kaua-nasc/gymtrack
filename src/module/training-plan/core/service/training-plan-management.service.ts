import { Injectable } from '@nestjs/common';
import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';
import { TrainingPlanModel } from '@src/module/training-plan/core/model/training-plan.model';
import { TrainingPlanRepository } from '@src/module/training-plan/persistence/repository/training-plan.repository';
import { DayManagementService } from './day-management.service';

@Injectable()
export class TrainingPlanManagementService {
  constructor(
    private readonly trainingPlanRepository: TrainingPlanRepository,
    private readonly dayManagementService: DayManagementService
  ) {}

  async createTrainingPlan(trainingPlan: Input) {
    const newTrainingPlan = await this.trainingPlanRepository.saveTrainingPlan(
      TrainingPlanModel.create({
        ...trainingPlan,
        days: [],
      })
    );

    return newTrainingPlan;
  }

  async traningPlanExists(trainingPlanId: string) {
    return await this.trainingPlanRepository.traningPlanExists(trainingPlanId);
  }

  async getTrainingPlansByUserId(userId: string) {
    const traningPlans = await this.trainingPlanRepository.findMany({
      where: { userId },
    });

    return traningPlans ?? [];
  }

  async getTrainingPlanId(id: string) {
    const traningPlans = await this.trainingPlanRepository.findOneById(id);

    return traningPlans;
  }

  async deleteTrainingPlan(id: string) {
    await this.trainingPlanRepository.delete({ id });
  }
}

type Input = {
  name: string;
  userId: string;
  timeInDays: number;
  type: TrainingType;
  observation: string | null;
  pathology: string | null;
  level: TrainingLevel;
};
