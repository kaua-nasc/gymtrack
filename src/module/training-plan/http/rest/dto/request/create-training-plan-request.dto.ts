import { TrainingPlanLevel } from '@src/module/training-plan/core/enum/training-plan-level.enum';
import { TrainingPlanType } from '@src/module/training-plan/core/enum/training-plan-type.enum';
import { TrainingPlanVisibility } from '@src/module/training-plan/core/enum/training-plan-visibility.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTrainingPlanRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsUUID()
  readonly authorId: string;

  readonly lastUpdatedBy: string;

  @IsInt()
  readonly timeInDays: number;

  @IsEnum(TrainingPlanType)
  readonly type: TrainingPlanType;

  readonly observation?: string;

  readonly pathology?: string;

  @IsEnum(TrainingPlanLevel)
  readonly level: TrainingPlanLevel;

  @IsEnum(TrainingPlanVisibility)
  readonly visibility: TrainingPlanVisibility;
}
