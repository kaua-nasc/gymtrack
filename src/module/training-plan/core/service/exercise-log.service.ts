import { Injectable } from '@nestjs/common';
import { ExerciseLogRepository } from '../../persistence/repository/exercise-log.repository';
import { CreateExerciseLogRequestDto } from '../../http/rest/dto/request/create-exercise-log-request.dto';
import { ExerciseLog } from '../../persistence/entity/exercise-log.entity';

@Injectable()
export class ExerciseLogService {
  constructor(private readonly exerciseLogRepository: ExerciseLogRepository) {}

  async createLog(data: CreateExerciseLogRequestDto): Promise<ExerciseLog> {
    const log = this.exerciseLogRepository.create({
      userId: data.userId,
      exerciseId: data.exerciseId,
      reps: data.reps,
      weight: data.weight,
      notes: data.notes,
    });

    return this.exerciseLogRepository.save(log);
  }

  async getLogsForUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseLog[]> {
    return this.exerciseLogRepository.findLogsByExerciseAndUser(
      exerciseId,
      userId,
    );
  }
}
