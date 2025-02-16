import { Injectable } from '@nestjs/common';
import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { CreateDayRequestDto } from '@src/module/training-plan/http/rest/dto/request/create-day-request.dto';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class CreateDayUseCase {
  constructor(private readonly dayRepository: DayRepository) {}

  async execute(dayData: CreateDayRequestDto) {
    return await this.dayRepository.saveDay(
      DayModel.create({
        ...dayData,
        exercises: [],
      })
    );
  }
}
