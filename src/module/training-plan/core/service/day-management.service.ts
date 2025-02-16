import { Injectable } from '@nestjs/common';
import { DayModel } from '@src/module/training-plan/core/model/day.model';
import { ExerciseModel } from '@src/module/training-plan/core/model/exercise.model';
import { DayRepository } from '@src/module/training-plan/persistence/repository/day.repository';

@Injectable()
export class DayManagementService {
  constructor(private readonly dayRepository: DayRepository) {}
  async createDay(day: {
    name: string;
    trainingPlanId: string;
    exercises: ExerciseModel[];
  }) {
    const newTraining = DayModel.create({
      name: day.name,
      trainingPlanId: day.trainingPlanId,
      exercises: day.exercises,
    });

    return await this.dayRepository.saveDay({ ...newTraining });
  }

  async getDays(trainingPlanId: string) {
    return await this.dayRepository.findDaysByTrainingPlanId(trainingPlanId);
  }

  async findDayById(dayId: string) {
    return await this.dayRepository.findDayById(dayId);
  }

  async deleteDayById(id: string) {
    return await this.dayRepository.deleteDayById(id);
  }

  async findDaysByTrainingPlanIdRecursivaly(trainingPlanId: string) {
    return await this.dayRepository.findDaysByTrainingPlanId(trainingPlanId, true);
  }

  async findDayRecursivaly(id: string) {
    return await this.dayRepository.findDayById(id, true);
  }

  async updateDayName(dayId: string, data: { name: string }) {
    const day = await this.dayRepository.findDayById(dayId, true);

    if (!day) {
      throw new Error();
    }

    day.name = data.name;

    await this.dayRepository.saveDay(day);
  }
}
