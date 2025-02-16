import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class DeleteDayUseCase {
  constructor(private readonly dayRepository: DayRepository) {}

  async execute(id: string) {
    return await this.dayRepository.deleteDayById(id);
  }
}
