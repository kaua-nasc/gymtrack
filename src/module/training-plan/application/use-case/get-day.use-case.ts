import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class GetDayUseCase {
  constructor(private readonly dayRepository: DayRepository) {}

  async execute(id: string, recursivaly = false) {
    return this.dayRepository.findDayById(id, recursivaly);
  }
}
