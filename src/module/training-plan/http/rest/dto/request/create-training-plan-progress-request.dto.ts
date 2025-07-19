import { IsUUID } from 'class-validator';

export class CreateTrainingPlanProgressRequestDto {
  @IsUUID()
  readonly userId: string;

  @IsUUID()
  readonly trainingPlanId: string;
}
