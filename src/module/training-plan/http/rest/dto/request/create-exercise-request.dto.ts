import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExerciseRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  dayId: string;

  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsInt()
  setsNumber: number;

  @IsInt()
  repsNumber: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  observation?: string;
}
