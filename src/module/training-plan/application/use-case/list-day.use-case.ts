import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class LisDayUseCase {
  constructor(private readonly dayRepository: DayRepository) {}

  async execute(trainingPlanId: string, recursivaly = false) {
    return await this.dayRepository.findDaysByTrainingPlanId(trainingPlanId, recursivaly);
  }
}
