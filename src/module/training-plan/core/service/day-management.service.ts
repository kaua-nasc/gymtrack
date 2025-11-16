import { Injectable } from '@nestjs/common';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';
import { CreateDayRequestDto } from '../../http/rest/dto/request/create-day-request.dto';
import { Day } from '../../persistence/entity/day.entity';
import { CreateManyDayRequestDto } from '../../http/rest/dto/request/create-many-day-request.dto';
import { Exercise } from '../../persistence/entity/exercise.entity';
import { ExerciseRepository } from '../../persistence/repository/exercise.repository';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

@Injectable()
export class DayManagementService {
  constructor(
    private readonly dayRepository: DayRepository,
    private readonly exerciseRepository: ExerciseRepository,
    private readonly logger: AppLogger
  ) {}

  async create(dayData: CreateDayRequestDto) {
    this.logger.log('Attempting to create a new day', {
      name: dayData.name,
      trainingPlanId: dayData.trainingPlanId,
    });
    const savedDay = await this.dayRepository.save(new Day({ ...dayData }));
    this.logger.log('Successfully created new day', { dayId: savedDay.id });
    return savedDay;
  }

  async createMany(days: CreateManyDayRequestDto[]) {
    this.logger.log(`Attempting to create ${days.length} days and their exercises.`);
    for (const key in days) {
      if (Object.prototype.hasOwnProperty.call(days, key)) {
        const day = days[key];

        this.logger.log('Creating day...', {
          name: day.name,
          trainingPlanId: day.trainingPlanId,
        });
        const savedDay = await this.dayRepository.save(
          new Day({
            name: day.name,
            trainingPlanId: day.trainingPlanId,
          })
        );
        this.logger.log(`Successfully saved day: ${savedDay.id}. Now adding exercises.`);

        for (const key in day.exercises) {
          if (Object.prototype.hasOwnProperty.call(day.exercises, key)) {
            const exercise = day.exercises[key];
            this.logger.log(`Adding exercise: ${exercise.name} to day: ${savedDay.id}`);
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
        this.logger.log(`Finished adding exercises for day: ${savedDay.id}`);
      }
    }
    this.logger.log('Finished createMany operation for all days.');
  }

  async delete(id: string) {
    this.logger.log(`Attempting to delete day with id: ${id}`);
    const result = await this.dayRepository.delete({ id });

    this.logger.log(`Successfully deleted day ${id}.`);

    return result;
  }
}
