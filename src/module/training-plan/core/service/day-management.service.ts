import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';
import { CreateDayRequestDto } from '../../http/rest/dto/request/create-day-request.dto';
import { Day } from '../../persistence/entity/day.entity';

@Injectable()
export class DayManagementService {
  constructor(private readonly dayRepository: DayRepository) {}

  async create(dayData: CreateDayRequestDto) {
    return await this.dayRepository.save(new Day({ ...dayData }));
  }

  async delete(id: string) {
    return await this.dayRepository.delete({ id });
  }
}
