import { Injectable } from '@nestjs/common';
import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { TrainingModel } from '@src/module/training-plan/core/model/training.model';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class DayManagementService {
  constructor(private readonly dayRepository: DayRepository) {}
  async createDay(day: { trainingPlanId: string; trainings: TrainingModel[] }) {
    const newTraining = DayModel.create({
      trainingPlanId: day.trainingPlanId,
      trainings: day.trainings,
    });

    return await this.dayRepository.saveDay({ ...newTraining });
  }

  async getDays(trainingPlanId: string) {
    return await this.dayRepository.findMany({ where: { trainingPlanId } });
  }

  async getDay(dayId: string) {
    return await this.dayRepository.findOneById(dayId);
  }

  async deleteOne(id: string) {
    return await this.dayRepository.delete({ id });
  }
}
