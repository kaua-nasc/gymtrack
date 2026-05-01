import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import dayjs from 'dayjs';
import { CreateExerciseLogRequestDto } from '../../http/rest/dto/request/create-exercise-log-request.dto';
import { WeeklyActivityResponseDto } from '../../http/rest/dto/response/weekly-activity-response.dto';
import { ExerciseLog } from '../../persistence/entity/exercise-log.entity';
import { ExerciseLogRepository } from '../../persistence/repository/exercise-log.repository';
import { PlanDayProgressRepository } from '../../persistence/repository/plan-day-progress.repository';

@Injectable()
export class ExerciseLogService {
  constructor(
    private readonly exerciseLogRepository: ExerciseLogRepository,
    private readonly planDayProgressRepository: PlanDayProgressRepository,
    @Inject(REQUEST) private readonly request: { user: { id: string } }
  ) {}

  async createLog(data: CreateExerciseLogRequestDto): Promise<ExerciseLog> {
    const log = new ExerciseLog(data);

    return this.exerciseLogRepository.save(log);
  }

  async getLogsForUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseLog[]> {
    return this.exerciseLogRepository.findLogsByExerciseAndUser(exerciseId, userId);
  }

  async getWeeklyActivity(): Promise<WeeklyActivityResponseDto> {
    const userId = this.request.user.id;

    // Get Monday of the current week
    const today = dayjs().startOf('day');
    const startOfWeek = today.subtract((today.day() + 6) % 7, 'day');
    const endOfWeek = startOfWeek.add(6, 'days').endOf('day');

    const trainingDays = await this.planDayProgressRepository.findCompletedTrainingDays(
      userId,
      startOfWeek.toDate(),
      endOfWeek.toDate()
    );

    const trainedDates = trainingDays.map((date) => dayjs(date).format('YYYY-MM-DD'));

    return {
      mon: trainedDates.includes(startOfWeek.format('YYYY-MM-DD')),
      tue: trainedDates.includes(startOfWeek.add(1, 'day').format('YYYY-MM-DD')),
      wed: trainedDates.includes(startOfWeek.add(2, 'day').format('YYYY-MM-DD')),
      thu: trainedDates.includes(startOfWeek.add(3, 'day').format('YYYY-MM-DD')),
      fri: trainedDates.includes(startOfWeek.add(4, 'day').format('YYYY-MM-DD')),
      sat: trainedDates.includes(startOfWeek.add(5, 'day').format('YYYY-MM-DD')),
      sun: trainedDates.includes(startOfWeek.add(6, 'day').format('YYYY-MM-DD')),
    };
  }
}
