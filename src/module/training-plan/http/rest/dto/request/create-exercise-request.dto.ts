import { ExerciseType } from '@src/module/training-plan/core/enum/exercise-type.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  observation?: string;
}
