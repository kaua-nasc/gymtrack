import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActiveSetLogResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  exerciseId: string;

  @ApiProperty({ example: 0 })
  setIndex: number;

  @ApiProperty({ example: 10 })
  reps: number;

  @ApiProperty({ example: 60.5 })
  weight: number;

  @ApiPropertyOptional({ example: 8 })
  rpe?: number;
}

export class ActiveWorkoutSessionResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  userId: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  planDayProgressId: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  currentExerciseId?: string;

  @ApiProperty({ example: 0 })
  currentSetIndex: number;

  @ApiPropertyOptional({ example: '2026-03-02T10:00:00Z' })
  restStartedAt?: Date;

  @ApiPropertyOptional({ example: 60 })
  adaptiveRestDurationSeconds?: number;

  @ApiProperty({ example: '2026-03-02T10:00:00Z' })
  startedAt: Date;

  @ApiProperty({ example: '2026-03-02T10:30:00Z' })
  lastActiveAt: Date;

  @ApiProperty({ type: [ActiveSetLogResponseDto] })
  logs: ActiveSetLogResponseDto[];
}
