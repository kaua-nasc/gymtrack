import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class DayManagementService {
  constructor(private readonly dayRepository: DayRepository) {}

  // async create(dayData: CreateDayRequestDto) {
  //   return await this.dayRepository.saveDay({ ...dayData });
  // }

  async delete(id: string) {
    return await this.dayRepository.deleteDayById(id);
  }

  async get(id: string, recursivaly = false) {
    return this.dayRepository.findDayById(id, recursivaly);
  }

  async list(trainingPlanId: string, recursivaly = false) {
    return await this.dayRepository.findDaysByTrainingPlanId(trainingPlanId, recursivaly);
  }
}
