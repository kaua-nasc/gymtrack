import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';
import { CreateDayRequestDto } from '../../http/rest/dto/request/create-day-request.dto';
import { Day } from '../../persistence/entity/day.entity';
import { CreateManyDayRequestDto } from '../../http/rest/dto/request/create-many-day-request.dto';
import { Exercise } from '../../persistence/entity/exercise.entity';
import { ExerciseRepository } from '../../persistence/repository/exercise.repository';

@Injectable()
export class DayManagementService {
  constructor(
    private readonly dayRepository: DayRepository,
    private readonly exerciseRepository: ExerciseRepository
  ) {}

  async create(dayData: CreateDayRequestDto) {
    return await this.dayRepository.save(new Day({ ...dayData }));
  }

  async createMany(days: CreateManyDayRequestDto[]) {
    for (const key in days) {
      if (Object.prototype.hasOwnProperty.call(days, key)) {
        const day = days[key];

        const savedDay = await this.dayRepository.save(
          new Day({
            name: day.name,
            trainingPlanId: day.trainingPlanId,
          })
        );
        for (const key in day.exercises) {
          if (Object.prototype.hasOwnProperty.call(day.exercises, key)) {
            const exercise = day.exercises[key];
            await this.exerciseRepository.save(
              new Exercise({
                dayId: savedDay.id,
                name: exercise.name,
                description: exercise.description,
                observation: exercise.observation,
                repsNumber: exercise.repsNumber,
                setsNumber: exercise.setsNumber,
                type: exercise.type,
              })
            );
          }
        }
      }
    }
  }

  async delete(id: string) {
    return await this.dayRepository.delete({ id });
  }
}
