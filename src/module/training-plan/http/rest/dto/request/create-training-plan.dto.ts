import { TrainingLevel } from '@src/module/training-plan/core/enum/training-level.enum';
import { TrainingType } from '@src/module/training-plan/core/enum/training-type.enum';

export class CreateTrainingPlanReqeustDto {
  name: string;
  userId: string;
  timeInDays: number;
  type: TrainingType;
  observation: string | null;
  pathology: string | null;
  level: TrainingLevel;
}
