import { IsUUID } from 'class-validator';

export class CreatePlanDayProgressRequestDto {
  @IsUUID()
  readonly planSubscriptionId: string;

  @IsUUID()
  readonly dayId: string;
}
